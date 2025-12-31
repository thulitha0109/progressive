import { NextRequest, NextResponse } from "next/server"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"
import { prisma } from "@/lib/prisma"

const GENERIC_TYPES = ["events", "shops", "products", "image", "images"]

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const type = formData.get("type") as string
        const entityType = formData.get("entityType") as "artist" | "podcast" | undefined

        // Artist specific
        const artistId = formData.get("artistId") as string

        // Podcast specific
        // const hostName = formData.get("hostName") as string // Removed in favor of artistId

        console.log(`[Upload] Request received: type=${type}, entityType=${entityType}, fileName=${file?.name}, size=${file?.size}`)

        if (!file || !type) {
            console.error("[Upload] Missing required fields: file or type")
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            )
        }

        let uploadPath = ""

        // 1. Handle Podcast Uploads
        if (entityType === "podcast") {
            if (!artistId) {
                console.error(`[Upload] Artist ID missing for podcast upload`)
                return NextResponse.json(
                    { error: "Artist ID is required for podcasts" },
                    { status: 400 }
                )
            }

            // Get artist slug
            const artist = await prisma.artist.findUnique({
                where: { id: artistId },
                select: { slug: true }
            })

            if (!artist) {
                console.error(`[Upload] Artist not found for id=${artistId}`)
                return NextResponse.json(
                    { error: "Artist not found" },
                    { status: 404 }
                )
            }

            // Save to podcasts directory but organize by artist slug
            // e.g. /uploads/podcasts/artist-slug/file.mp3
            uploadPath = await saveUploadedFile(
                file,
                UPLOAD_DIRS.PODCASTS,
                artist.slug
            )
        }
        // 2. Handle Blog Uploads
        else if (type === "blog") {
            // Blog images - no artist/host required
            uploadPath = await saveUploadedFile(
                file,
                UPLOAD_DIRS.BLOG,
                "" // No subdirectory needed for blog
            )
        }
        // 3. Handle Generic Admin Uploads (Events, Shops, Products, specific generic images)
        else if (GENERIC_TYPES.includes(type)) {
            // Map "image" or "images" to the IMAGES directory, otherwise use the type name (events, shops, products)
            const targetDir = (type === "image" || type === "images")
                ? UPLOAD_DIRS.IMAGES
                : type

            uploadPath = await saveUploadedFile(
                file,
                targetDir,
                ""
            )
        }
        // 4. Default: Handle Artist Uploads (Audio or Artist Images)
        else {
            if (!artistId) {
                console.error(`[Upload] Artist ID missing for type=${type}`)
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
                console.error(`[Upload] Artist not found for id=${artistId}`)
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

        console.log(`[Upload] Successfully saved to: ${uploadPath}`)
        return NextResponse.json({ url: uploadPath })
    } catch (error) {
        console.error("[Upload] Critical error:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
