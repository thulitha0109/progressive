"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"
import { generateWaveformPeaks } from "@/lib/waveform-peaks"
import path from "path"

export async function getTracks(page: number = 1, pageSize: number = 10, genre?: string, status: 'published' | 'upcoming' | 'all' = 'published', type?: string) {
    const skip = (page - 1) * pageSize
    const session = await auth()
    const userId = session?.user?.id
    const now = new Date()

    // Build where clause
    const where: any = {
        deletedAt: null // Only show non-deleted tracks
    }

    if (status === 'published') {
        where.scheduledFor = { lte: now }
    } else if (status === 'upcoming') {
        where.scheduledFor = { gt: now }
    }

    if (genre && genre !== "all") {
        where.genreId = genre
    }

    if (type && type !== "all") {
        where.type = type
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
            deletedAt: null,
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
            genreRel: {
                include: {
                    parent: true
                }
            },
            _count: {
                select: {
                    likedBy: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function createTrack(formData: FormData) {
    const title = formData.get("title") as string
    const artistId = formData.get("artistId") as string
    const genreId = (formData.get("genreId") as string) || null
    const type = (formData.get("type") as string) || null // Default to null (Original)
    const scheduledForStr = formData.get("scheduledFor") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    const audioUrlFromForm = formData.get("audioUrl") as string
    const imageUrlFromForm = formData.get("imageUrl") as string

    if (!title || !artistId || !scheduledForStr) {
        console.error("Missing required fields:", { title, artistId, scheduledForStr })
        throw new Error("All fields are required")
    }

    // If no pre-uploaded audio URL, check for file
    if (!audioUrlFromForm && (!audioFile || audioFile.size === 0)) {
        throw new Error("Audio file is required")
    }

    // Validate file sizes (150MB for audio, 10MB for images)
    const MAX_AUDIO_SIZE = 150 * 1024 * 1024 // 150MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
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

        // Handle Audio Upload
        let audioUrl = audioUrlFromForm
        if (!audioUrl && audioFile) {
            audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.ARTISTS, artist.slug)
            console.log("Audio uploaded successfully:", audioUrl)
        }

        // Handle Image Upload
        let imageUrl = imageUrlFromForm || null
        if (!imageUrl && imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.ARTISTS, artist.slug)
            console.log("Image uploaded successfully:", imageUrl)
        }

        // Parse scheduledFor with Colombo timezone (+05:30) if not present
        const scheduledFor = new Date(scheduledForStr.includes('+') ? scheduledForStr : `${scheduledForStr}+05:30`)

        const track = await prisma.track.create({
            data: {
                title,
                audioUrl,
                imageUrl,
                genreId: genreId === "none" ? null : genreId,
                type,
                scheduledFor,
                artistId,
            },
        })

        // Generate waveform peaks asynchronously (don't block the response)
        if (audioUrl) {
            let audioFilePath: string

            // Determine if it's a local file (legacy) or S3/Proxy URL
            if (audioUrl.startsWith('/s3-storage') || audioUrl.startsWith('http')) {
                // Pass URL directly to waveform generator (it handles downloading)
                audioFilePath = audioUrl
            } else {
                // Legacy local file in public directory
                const cleanAudioUrl = audioUrl.startsWith('/api/') ? audioUrl.replace('/api/', '/') : audioUrl
                audioFilePath = path.join(process.cwd(), 'public', cleanAudioUrl)
            }

            console.log(`[WAVEFORM] Starting peak generation for track ${track.id}`)
            console.log(`[WAVEFORM] Audio URL: ${audioUrl}`)
            console.log(`[WAVEFORM] Input path for generator: ${audioFilePath}`)

            generateWaveformPeaks(audioFilePath, 1000)
                .then(async (peaks) => {
                    if (peaks) {
                        console.log(`[WAVEFORM] Successfully generated ${peaks.length} peaks for track ${track.id}`)
                        await prisma.track.update({
                            where: { id: track.id },
                            data: { waveformPeaks: peaks },
                        })
                        console.log(`[WAVEFORM] ✅ Peaks saved to database for track: ${track.id}`)
                    } else {
                        console.log(`[WAVEFORM] ⚠️  Peak generation returned null for track ${track.id}`)
                    }
                })
                .catch(err => {
                    console.error(`[WAVEFORM] ❌ Failed to generate peaks for track ${track.id}:`, err)
                })
        }

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
    const type = (formData.get("type") as string) || null // Default to null
    const scheduledForStr = formData.get("scheduledFor") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !artistId || !scheduledForStr) {
        throw new Error("Title, Artist, and Schedule are required")
    }

    // Validate file sizes
    const MAX_AUDIO_SIZE = 150 * 1024 * 1024 // 150MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
        throw new Error(`Audio file is too large. Maximum size is 50MB. Your file is ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
        throw new Error(`Image file is too large. Maximum size is 10MB. Your file is ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    // Parse scheduledFor with Colombo timezone (+05:30) if not present
    const scheduledFor = new Date(scheduledForStr.includes('+') ? scheduledForStr : `${scheduledForStr}+05:30`)

    const data: any = {
        title,
        artistId,
        genreId: genreId === "none" ? null : genreId,
        type,
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

        // Generate waveform peaks if audio was updated
        if (data.audioUrl) {
            let audioFilePath: string
            const audioUrl = data.audioUrl

            // Determine if it's a local file (legacy) or S3/Proxy URL
            if (audioUrl.startsWith('/s3-storage') || audioUrl.startsWith('http')) {
                audioFilePath = audioUrl
            } else {
                const cleanAudioUrl = audioUrl.startsWith('/api/') ? audioUrl.replace('/api/', '/') : audioUrl
                audioFilePath = path.join(process.cwd(), 'public', cleanAudioUrl)
            }

            console.log(`[WAVEFORM-UPDATE] Starting peak generation for track ${id}`)
            console.log(`[WAVEFORM-UPDATE] Audio URL: ${audioUrl}`)
            console.log(`[WAVEFORM-UPDATE] Input path for generator: ${audioFilePath}`)

            generateWaveformPeaks(audioFilePath, 1000)
                .then(async (peaks) => {
                    if (peaks) {
                        await prisma.track.update({
                            where: { id },
                            data: { waveformPeaks: peaks },
                        })
                        console.log(`Waveform peaks updated for track: ${id}`)
                    }
                })
                .catch(err => console.error('Failed to generate peaks:', err))
        }

        revalidatePath("/admin/tracks")
    } catch (error) {
        console.error("Failed to update track:", error)
        throw new Error(`Failed to update track: ${error}`)
    }

    // Redirect outside try-catch
    redirect("/admin/tracks")
}

export async function setFeaturedTrack(id: string) {
    try {
        // Unset all featured tracks
        await prisma.track.updateMany({
            where: { isFeatured: true },
            data: { isFeatured: false },
        })

        // Unset all featured podcasts (Shared exclusivity)
        await prisma.podcast.updateMany({
            where: { isFeatured: true },
            data: { isFeatured: false },
        })

        // Set the new featured track
        await prisma.track.update({
            where: { id },
            data: { isFeatured: true },
        })

        revalidatePath("/admin/tracks")
        revalidatePath("/admin/podcasts")
        revalidatePath("/")
    } catch (error) {
        console.error("Failed to set featured track:", error)
        throw new Error("Failed to set featured track")
    }
}
