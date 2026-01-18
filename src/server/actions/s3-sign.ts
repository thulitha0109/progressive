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

    // Dynamically determine the host from the request headers
    const headersList = await headers()
    let host = headersList.get("host")

    // If host is internal (localhost:3000) or missing, prefer AUTH_URL
    // This fixes issues where internal docker networking makes the host appear as 3000
    if (!host || host.includes("localhost:3000")) {
        try {
            const authUrl = new URL(process.env.AUTH_URL || "http://localhost:3000")
            host = authUrl.host
        } catch (e) {
            host = "localhost:3000"
        }
    }

    // Strip port if present to get hostname for protocol check
    const hostname = host.split(":")[0]
    const protocol = (hostname === "localhost" || hostname === "127.0.0.1") ? "http" : "https"

    // Construct Upload URL using the /s3-storage rewrite proxy
    // This avoids direct access to port 9000 (which is HTTP only) preventing SSL Protocol Errors
    // Use the internal endpoint for signing configuration
    // This ensures the signature matches the Host header MinIO sees (which is 'minio:9000' after Next.js proxy)
    const internalEndpoint = process.env.S3_ENDPOINT || "http://localhost:9000"

    // Create a request-specific S3 Client using the internal endpoint
    const signingClient = new S3Client({
        region: process.env.S3_REGION || "us-east-1",
        endpoint: internalEndpoint,
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
        const rawSignedUrl = await getSignedUrl(signingClient, command, { expiresIn: 3600 })

        // The signed URL points to the internal endpoint (e.g. http://minio:9000/...)
        // We need to rewrite the origin to the public proxy path so the client can reach it
        // The signature in the query params remains valid for the internal host
        const publicBaseUrl = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || "/s3-storage"

        // Replace the internal origin with the public proxy base
        // We construct the client-facing URL by taking the path and query from the raw signed URL
        // and appending it to the public base
        const internalUrl = new URL(rawSignedUrl)

        // internalUrl.pathname includes /bucket-name/key
        // publicBaseUrl might be /s3-storage
        // We want: https://progressive.lk/s3-storage/bucket-name/key?signature

        // Determine the public origin (protocol + host)
        const publicOrigin = `${protocol}://${host}`

        // Remove leading slash from pathname if publicBaseUrl has trailing, or handle join cleanly
        // But simply: new URL(path, base) might be tricky with the proxy path

        // Let's manually construct to be safe
        // rawSignedUrl: http://minio:9000/bucket/key?query
        // We want: https://progressive.lk/s3-storage/bucket/key?query

        // NOTE: Next.js rewrite is /s3-storage/:path* -> http://minio:9000/:path*
        // So /s3-storage maps to root of minio:9000

        const pathAndQuery = internalUrl.pathname + internalUrl.search
        const safePublicBase = publicBaseUrl.endsWith('/') ? publicBaseUrl.slice(0, -1) : publicBaseUrl

        // Final URL: https://progressive.lk/s3-storage/bucket/key?...
        const signedUrl = `${publicOrigin}${safePublicBase}${pathAndQuery}`

        // Construct the public URL (what the database will save)
        const normalizedBase = safePublicBase
        const publicUrl = `${normalizedBase}/${BUCKET_NAME}/${key}`

        return { signedUrl, publicUrl, key }
    } catch (error) {
        console.error("Error generating presigned URL:", error)
        throw new Error("Failed to generate upload URL")
    }
}
