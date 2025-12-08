import { NextRequest, NextResponse } from "next/server"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const type = formData.get("type") as "audio" | "image" | "blog"
        const entityType = formData.get("entityType") as "artist" | "podcast" | undefined

        // Artist specific
        const artistId = formData.get("artistId") as string

        // Podcast specific
        const hostName = formData.get("hostName") as string

        if (!file || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        let uploadPath = ""

        if (entityType === "podcast") {
            if (!hostName) {
                return NextResponse.json(
                    { error: "Host name is required for podcasts" },
                    { status: 400 }
                )
            }
            // Generate simple slug for host
            const hostSlug = hostName
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '-')
                .replace(/[^\w\-]+/g, '')

            uploadPath = await saveUploadedFile(
                file,
                UPLOAD_DIRS.PODCASTS,
                hostSlug
            )
        } else if (type === "blog") {
            // Blog images - no artist/host required
            uploadPath = await saveUploadedFile(
                file,
                UPLOAD_DIRS.BLOG,
                "" // No subdirectory needed for blog
            )
        } else {
            // Default to artist (backward compatibility)
            if (!artistId) {
                return NextResponse.json(
                    { error: "Artist ID is required" },
                    { status: 400 }
                )
            }

            // Get artist slug
            const artist = await prisma.artist.findUnique({
                where: { id: artistId },
                select: { slug: true }
            })

            if (!artist) {
                return NextResponse.json(
                    { error: "Artist not found" },
                    { status: 404 }
                )
            }

            uploadPath = await saveUploadedFile(
                file,
                UPLOAD_DIRS.ARTISTS,
                artist.slug
            )
        }

        return NextResponse.json({ url: uploadPath })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
