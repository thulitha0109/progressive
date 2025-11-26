"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"

export async function getTracks(page: number = 1, pageSize: number = 10, genre?: string) {
    const skip = (page - 1) * pageSize
    const session = await auth()
    const userId = session?.user?.id
    const now = new Date()

    // Build where clause
    const where: any = {
        scheduledFor: { lte: now }, // Only show published tracks
        deletedAt: null // Only show non-deleted tracks
    }

    if (genre && genre !== "all") {
        where.genreId = genre
    }

    const [tracksRaw, totalCount] = await Promise.all([
        prisma.track.findMany({
            where,
            include: {
                artist: true,
                genreRel: true,
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.track.count({ where }),
    ])

    // Get user's liked tracks
    let likedTrackIds = new Set<string>()
    if (userId) {
        const userLikes = await prisma.user.findUnique({
            where: { id: userId },
            select: { likes: { select: { id: true } } },
        })
        if (userLikes) {
            likedTrackIds = new Set(userLikes.likes.map((t: { id: string }) => t.id))
        }
    }

    // Add like data to tracks
    const tracks = tracksRaw.map((track: any) => ({
        ...track,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
        tracks,
        totalCount,
        totalPages,
        currentPage: page,
    }
}


export async function getUpcomingTracks() {
    return await prisma.track.findMany({
        where: {
            scheduledFor: {
                gt: new Date(),
            },
        },
        include: {
            artist: true,
            genreRel: true,
        },
        orderBy: { scheduledFor: "asc" },
    })
}

export async function getTrack(id: string) {
    return await prisma.track.findUnique({
        where: { id },
        include: {
            artist: true,
            genreRel: true,
        },
    })
}

export async function getLikedTracks(userId: string) {
    return await prisma.track.findMany({
        where: {
            likedBy: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            artist: true,
            genreRel: true,
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function createTrack(formData: FormData) {
    const title = formData.get("title") as string
    const artistId = formData.get("artistId") as string
    const genreId = (formData.get("genreId") as string) || null
    const scheduledForStr = formData.get("scheduledFor") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !artistId || !scheduledForStr || !audioFile || audioFile.size === 0) {
        console.error("Missing required fields:", { title, artistId, scheduledForStr, audioFile })
        throw new Error("All fields are required and audio file must not be empty")
    }

    // Validate file sizes (50MB for audio, 10MB for images)
    const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

    if (audioFile.size > MAX_AUDIO_SIZE) {
        throw new Error(`Audio file is too large. Maximum size is 50MB. Your file is ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
        throw new Error(`Image file is too large. Maximum size is 10MB. Your file is ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    try {
        // Get artist slug for file path
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            select: { slug: true }
        })

        if (!artist) {
            throw new Error("Artist not found")
        }

        // Handle Audio Upload using artist slug
        const audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.ARTISTS, artist.slug)
        console.log("Audio uploaded successfully:", audioUrl)

        // Handle Image Upload (Optional)
        let imageUrl = null
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.ARTISTS, artist.slug)
            console.log("Image uploaded successfully:", imageUrl)
        }

        const scheduledFor = new Date(scheduledForStr)

        await prisma.track.create({
            data: {
                title,
                audioUrl,
                imageUrl,
                genreId: genreId === "none" ? null : genreId,
                scheduledFor,
                artistId,
            },
        })

        revalidatePath("/admin/tracks")
    } catch (error) {
        console.error("Failed to create track:", error)
        throw new Error(`Failed to create track: ${error}`)
    }

    // Redirect outside try-catch to avoid catching the redirect error
    redirect("/admin/tracks")
}

export async function deleteTrack(id: string) {
    try {
        await prisma.track.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
        revalidatePath("/admin/tracks")
        revalidatePath("/admin/tracks/trash")
    } catch (error) {
        console.error("Failed to delete track:", error)
        throw new Error("Failed to delete track")
    }
}

export async function restoreTrack(id: string) {
    try {
        await prisma.track.update({
            where: { id },
            data: { deletedAt: null }
        })
        revalidatePath("/admin/tracks")
        revalidatePath("/admin/tracks/trash")
    } catch (error) {
        console.error("Failed to restore track:", error)
        throw new Error("Failed to restore track")
    }
}

export async function permanentDeleteTrack(id: string) {
    try {
        await prisma.track.delete({
            where: { id },
        })
        revalidatePath("/admin/tracks/trash")
    } catch (error) {
        console.error("Failed to permanently delete track:", error)
        throw new Error("Failed to permanently delete track")
    }
}

export async function getTrashedTracks() {
    return await prisma.track.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            artist: true,
            genreRel: true,
        },
        orderBy: { deletedAt: "desc" },
    })
}

export async function updateTrack(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const artistId = formData.get("artistId") as string
    const genreId = (formData.get("genreId") as string) || null
    const scheduledForStr = formData.get("scheduledFor") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !artistId || !scheduledForStr) {
        throw new Error("Title, Artist, and Schedule are required")
    }

    // Validate file sizes
    const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
        throw new Error(`Audio file is too large. Maximum size is 50MB. Your file is ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
        throw new Error(`Image file is too large. Maximum size is 10MB. Your file is ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    const scheduledFor = new Date(scheduledForStr)

    const data: any = {
        title,
        artistId,
        genreId: genreId === "none" ? null : genreId,
        scheduledFor,
    }

    try {
        // Get artist slug for file path
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            select: { slug: true }
        })

        if (!artist) {
            throw new Error("Artist not found")
        }

        // Handle Audio Upload with artist slug
        if (audioFile && audioFile.size > 0) {
            data.audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.ARTISTS, artist.slug)
            console.log("Audio updated successfully:", data.audioUrl)
        }

        // Handle Image Upload with artist slug
        if (imageFile && imageFile.size > 0) {
            data.imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.ARTISTS, artist.slug)
            console.log("Image updated successfully:", data.imageUrl)
        }

        await prisma.track.update({
            where: { id },
            data,
        })

        revalidatePath("/admin/tracks")
    } catch (error) {
        console.error("Failed to update track:", error)
        throw new Error(`Failed to update track: ${error}`)
    }

    // Redirect outside try-catch
    redirect("/admin/tracks")
}

export async function setFeaturedTrack(id: string) {
    // Unset all featured tracks
    await prisma.track.updateMany({
        where: { isFeatured: true },
        data: { isFeatured: false },
    })

    // Set the new featured track
    await prisma.track.update({
        where: { id },
        data: { isFeatured: true },
    })

    revalidatePath("/admin/tracks")
    revalidatePath("/")
}
