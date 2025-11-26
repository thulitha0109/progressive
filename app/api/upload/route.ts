import { NextRequest, NextResponse } from "next/server"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData()
        const file = formData.get("file") as File
        const artistId = formData.get("artistId") as string
        const type = formData.get("type") as "audio" | "image"

        if (!file || !artistId || !type) {
            return NextResponse.json(
                { error: "Missing required fields" },
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

        const url = await saveUploadedFile(
            file,
            UPLOAD_DIRS.ARTISTS,
            artist.slug
        )

        return NextResponse.json({ url })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: "Failed to upload file" },
            { status: 500 }
        )
    }
}
