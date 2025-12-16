import { NextRequest, NextResponse } from "next/server"
import { stat } from "fs/promises"
import { createReadStream, existsSync } from "fs"
import { join } from "path"

/**
 * API Route to serve uploaded files dynamically with Range support
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
        const { path } = await params

        if (!path || path.length === 0) {
            return NextResponse.json({ error: "File path is required" }, { status: 400 })
        }

        const filePath = join(process.cwd(), "public", "uploads", ...path)
        const uploadsDir = join(process.cwd(), "public", "uploads")

        if (!filePath.startsWith(uploadsDir)) {
            return NextResponse.json({ error: "Invalid file path" }, { status: 403 })
        }

        if (!existsSync(filePath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        const stats = await stat(filePath)
        const fileSize = stats.size
        const filename = path[path.length - 1]
        const mimeType = getMimeType(filename)
        const range = request.headers.get("range")

        if (range) {
            const parts = range.replace(/bytes=/, "").split("-")
            const start = parseInt(parts[0], 10)
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1
            const chunksize = (end - start) + 1

            const stream = createReadStream(filePath, { start, end })

            // Convert Node.js stream to Web ReadableStream
            const readableStream = new ReadableStream({
                start(controller) {
                    stream.on("data", (chunk) => {
                        if (controller.desiredSize === null) return
                        controller.enqueue(chunk)
                    })
                    stream.on("end", () => {
                        if (controller.desiredSize !== null) controller.close()
                    })
                    stream.on("error", (err) => {
                        if (controller.desiredSize !== null) controller.error(err)
                    })
                },
                cancel() {
                    stream.destroy()
                }
            })

            return new NextResponse(readableStream as any, {
                status: 206,
                headers: {
                    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
                    "Accept-Ranges": "bytes",
                    "Content-Length": chunksize.toString(),
                    "Content-Type": mimeType,
                    "Cache-Control": "public, max-age=31536000, immutable",
                },
            })
        } else {
            const stream = createReadStream(filePath)

            // Convert Node.js stream to Web ReadableStream
            const readableStream = new ReadableStream({
                start(controller) {
                    stream.on("data", (chunk) => {
                        if (controller.desiredSize === null) return
                        controller.enqueue(chunk)
                    })
                    stream.on("end", () => {
                        if (controller.desiredSize !== null) controller.close()
                    })
                    stream.on("error", (err) => {
                        if (controller.desiredSize !== null) controller.error(err)
                    })
                },
                cancel() {
                    stream.destroy()
                }
            })

            return new NextResponse(readableStream as any, {
                status: 200,
                headers: {
                    "Content-Length": fileSize.toString(),
                    "Content-Type": mimeType,
                    "Accept-Ranges": "bytes", // Advertise support for ranges
                    "Cache-Control": "public, max-age=31536000, immutable",
                    "Content-Disposition": `inline; filename="${filename}"`,
                },
            })
        }
    } catch (error) {
        console.error("Error serving uploaded file:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
