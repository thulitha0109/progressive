import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

/**
 * API Route to serve uploaded files dynamically in both dev and production modes
 * Handles: /api/uploads/artists/{artistId}/{filename}
 *          /api/uploads/podcasts/{filename}
 */

const MIME_TYPES: Record<string, string> = {
    // Audio
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".ogg": "audio/ogg",
    ".m4a": "audio/mp4",
    ".aac": "audio/aac",
    ".flac": "audio/flac",

    // Images
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",

    // Default
    default: "application/octet-stream",
}

function getMimeType(filename: string): string {
    const ext = filename.toLowerCase().match(/\.[^.]+$/)?.[0] || ""
    return MIME_TYPES[ext] || MIME_TYPES.default
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    try {
        // Await the params since they're a Promise in Next.js 16
        const { path } = await params

        if (!path || path.length === 0) {
            return NextResponse.json(
                { error: "File path is required" },
                { status: 400 }
            )
        }

        // Construct the file path
        // path will be like: ['artists', 'artistId', 'filename.mp3'] or ['podcasts', 'filename.mp3']
        const filePath = join(process.cwd(), "public", "uploads", ...path)

        // Security check: ensure the path is within the uploads directory
        const uploadsDir = join(process.cwd(), "public", "uploads")
        if (!filePath.startsWith(uploadsDir)) {
            console.error("Invalid file path - outside uploads directory:", filePath)
            return NextResponse.json(
                { error: "Invalid file path" },
                { status: 403 }
            )
        }

        // Check if file exists
        if (!existsSync(filePath)) {
            console.error("File not found:", filePath)
            return NextResponse.json(
                { error: "File not found" },
                { status: 404 }
            )
        }

        // Read the file
        const fileBuffer = await readFile(filePath)

        // Get the filename from the path
        const filename = path[path.length - 1]
        const mimeType = getMimeType(filename)

        // Return the file with appropriate headers
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                "Content-Type": mimeType,
                "Content-Length": fileBuffer.length.toString(),
                "Cache-Control": "public, max-age=31536000, immutable",
                "Content-Disposition": `inline; filename="${filename}"`,
            },
        })
    } catch (error) {
        console.error("Error serving uploaded file:", error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
