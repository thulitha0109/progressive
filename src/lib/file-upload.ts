import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { join } from "path"

/**
 * File upload utility for handling file storage in S3 (MinIO)
 */

export const UPLOAD_DIRS = {
    ARTISTS: "artists",
    PODCASTS: "podcasts",
    BLOG: "blog",
    EVENTS: "events",
    SHOPS: "shops",
    PRODUCTS: "products",
    IMAGES: "images",
} as const

// Initialize S3 Client
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
 * Generate a unique filename with timestamp prefix
 */
export function generateUniqueFilename(originalFilename: string): string {
    // Sanitize filename to remove special chars that might break S3 keys
    const sanitized = originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')
    return `${Date.now()}-${sanitized}`
}

/**
 * Save a file to S3
 * @param file - The File object to save
 * @param subDir - Subdirectory/Prefix (e.g., 'artists', 'podcasts')
 * @param additionalPaths - Additional path segments
 * @returns The public URL path to access the file
 */
export async function saveUploadedFile(
    file: File,
    subDir: string,
    ...additionalPaths: string[]
): Promise<string> {
    if (!file || file.size === 0) {
        throw new Error("Invalid file: File is empty or undefined")
    }

    try {
        const uniqueFilename = generateUniqueFilename(file.name)

        // Construct S3 Key (path)
        // e.g., artists/123/timestamp-file.jpg
        const keyPath = [subDir, ...additionalPaths, uniqueFilename].filter(Boolean).join("/")

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to S3
        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: keyPath,
            Body: buffer,
            ContentType: file.type,
            // ACL: "public-read", // MinIO buckets are usually private by default, configured via policy. 
            // We assume the bucket is configured to allow public reads for these paths.
        })

        await s3Client.send(command)

        // Return URL
        // If it's a known public bucket, we can construct the URL directly.
        // Or proxy it through Next.js if the bucket is private.
        // For MinIO dev setup, usually: http://localhost:9000/bucket-name/key
        // But for production via Nginx/CDN, it might be different.
        // Let's assume a direct public URL structure for now, or map it to an internal API proxy?
        // The previous implementation returned `/api/uploads/...`.
        // If we want to keep frontend compatible without changes, we might need to proxy.
        // HOWEVER, for performance, direct S3/MinIO URLs are better.
        // Let's return the relative path `/uploads/s3/...` and have a redirect? 
        // Or better: Return the full S3 URL if possible, or a predictable path we can route.

        // Simpler approach for transition: 
        // Return a URL that Nginx can proxy to MinIO.
        // e.g. /media/artists/123/file.jpg -> proxy_pass http://minio/bucket/artists/123/file.jpg

        // Let's use the standard MinIO path structure:
        // /bucket-name/key
        // But to make it cleaner on frontend:
        const endpoint = process.env.NEXT_PUBLIC_S3_PUBLIC_URL || process.env.S3_ENDPOINT || "http://localhost:9000"
        return `${endpoint}/${BUCKET_NAME}/${keyPath}`

    } catch (error) {
        console.error("Failed to save file to S3:", error)
        throw new Error(`Failed to save file: ${error}`)
    }
}

/**
 * Validate file type
 */
export function validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.some((type) => file.type.includes(type))
}

/**
 * Validate file size (in MB)
 */
export function validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
}
