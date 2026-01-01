"use server"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Initialize S3 Client (Same config as file-upload.ts, but standard initialization)
const s3Client = new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint: process.env.S3_ENDPOINT || "http://localhost:9000",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
        secretAccessKey: process.env.S3_SECRET_KEY || "minioadminpassword",
    },
    forcePathStyle: true, // Required for MinIO
})

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "progressive-uploads"

/**
 * Generate a Presigned URL for direct client-side upload (PUT)
 */
export async function getPresignedUrl(
    filename: string,
    fileType: string,
    folder: string = "uploads"
) {
    const session = await auth()
    if (!session?.user) {
        throw new Error("Unauthorized")
    }

    // Sanitize filename
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uniqueFilename = `${Date.now()}-${sanitized}`
    const key = `${folder}/${uniqueFilename}`

    // Dynamically determine the host from the request headers to support LAN/Remote access
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"

    // Strip port if present to get hostname
    const hostname = host.split(":")[0]

    // Construct Direct MinIO URL: http://<hostname>:9000
    // Use NEXT_PUBLIC_S3_DIRECT_URL if set, otherwise fallback to dynamic construction
    const directUploadHost = process.env.NEXT_PUBLIC_S3_DIRECT_URL || `http://${hostname}:9000`

    // Create a request-specific S3 Client using the external endpoint
    // This ensures the Host header in the signature matches the client's upload request
    const signingClient = new S3Client({
        region: process.env.S3_REGION || "us-east-1",
        endpoint: directUploadHost,
        credentials: {
            accessKeyId: process.env.S3_ACCESS_KEY || "minioadmin",
            secretAccessKey: process.env.S3_SECRET_KEY || "minioadminpassword",
        },
        forcePathStyle: true,
    })

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // ACL: "public-read", // Ensure bucket policy allows this or strip it if using policy-only
    })

    try {
        const signedUrl = await getSignedUrl(signingClient, command, { expiresIn: 3600 })

        // Construct the public URL (what the database will save)
        // We use the rewrite path /s3-storage for public access to keep it clean
        const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "/s3-storage"
        const normalizedBase = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl
        const publicUrl = `${normalizedBase}/${BUCKET_NAME}/${key}`

        // The signedUrl is already correct because we initialized the client with directUploadHost
        return { signedUrl, publicUrl, key }
    } catch (error) {
        console.error("Error generating presigned URL:", error)
        throw new Error("Failed to generate upload URL")
    }
}
