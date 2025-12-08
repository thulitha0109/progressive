import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

/**
 * File upload utility for handling file storage in both dev and production modes
 */

export const UPLOAD_DIRS = {
    ARTISTS: "artists",
    PODCASTS: "podcasts",
    BLOG: "blog",
} as const

/**
 * Get the absolute path to the uploads directory
 */
export function getUploadsDir(): string {
    return join(process.cwd(), "public", "uploads")
}

/**
 * Get the absolute path to a specific upload subdirectory
 */
export function getUploadSubDir(subDir: string, ...paths: string[]): string {
    return join(getUploadsDir(), subDir, ...paths)
}

/**
 * Ensure a directory exists, creating it recursively if needed
 */
export async function ensureDir(dirPath: string): Promise<void> {
    try {
        await mkdir(dirPath, { recursive: true })
    } catch (error) {
        console.error(`Failed to create directory ${dirPath}:`, error)
        throw new Error(`Failed to create upload directory: ${error}`)
    }
}

/**
 * Generate a unique filename with timestamp prefix
 */
export function generateUniqueFilename(originalFilename: string): string {
    return `${Date.now()}-${originalFilename}`
}

/**
 * Save a file to the specified directory
 * @param file - The File object to save
 * @param subDir - Subdirectory under uploads/ (e.g., 'artists', 'podcasts')
 * @param additionalPaths - Additional path segments (e.g., artistId)
 * @returns The URL path to access the file (e.g., '/api/uploads/artists/123/file.mp3')
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
        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.name)

        // Create full directory path
        const uploadDir = getUploadSubDir(subDir, ...additionalPaths)
        await ensureDir(uploadDir)

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Write file
        const filePath = join(uploadDir, uniqueFilename)
        await writeFile(filePath, buffer)

        console.log(`File saved successfully: ${filePath}`)

        // Return URL path using API route
        const urlParts = [subDir, ...additionalPaths, uniqueFilename]
        return `/api/uploads/${urlParts.join("/")}`
    } catch (error) {
        console.error("Failed to save file:", error)
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
