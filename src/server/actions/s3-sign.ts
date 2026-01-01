"use server"

import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { auth } from "@/auth"

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

    const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        ContentType: fileType,
        // ACL: "public-read", // Ensure bucket policy allows this or strip it if using policy-only
    })

    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        // Construct the public URL (what the database will save)
        // Similar logic to file-upload.ts
        const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "/s3-storage"
        const normalizedBase = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl
        const publicUrl = `${normalizedBase}/${BUCKET_NAME}/${key}`

        return { signedUrl, publicUrl, key }
    } catch (error) {
        console.error("Error generating presigned URL:", error)
        throw new Error("Failed to generate upload URL")
    }
}
