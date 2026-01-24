"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"
import { generateWaveformPeaks } from "@/lib/waveform-peaks"
import path from "path"

import { Prisma } from "@prisma/client"

/**
 * Generate URL-friendly slug from a string
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/[^\w\-]+/g, '')       // remove special chars
        .replace(/\-\-+/g, '-')         // collapse multiple hyphens
        .replace(/^-+/, '')             // trim hyphens from start
        .replace(/-+$/, '')             // trim hyphens from end
}

/**
 * Ensure slug is unique by adding numeric suffix if needed
 */
async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
        const existing = await prisma.podcast.findUnique({
            where: { slug },
            select: { id: true }
        })

        // If no existing podcast has this slug, or it's the podcast we're updating, it's unique
        if (!existing || (excludeId && existing.id === excludeId)) {
            return slug
        }

        // Try next variant
        counter++
        slug = `${baseSlug}-${counter}`
    }
}

export async function getPodcasts(
    page: number = 1,
    pageSize: number = 10,
    status: 'published' | 'upcoming' | 'all' = 'published',
    genreId?: string,
    type?: string
) {
    const skip = (page - 1) * pageSize
    const session = await auth()
    const userId = session?.user?.id
    const now = new Date()
    const where: Prisma.PodcastWhereInput = { deletedAt: null }

    if (status === 'published') {
        where.scheduledFor = { lte: now }
    } else if (status === 'upcoming') {
        where.scheduledFor = { gt: now }
    }

    if (genreId) {
        where.genreId = genreId
    }

    if (type) {
        where.type = type
    }

    const [podcastsRaw, totalCount] = await Promise.all([
        prisma.podcast.findMany({
            where,
            orderBy: { scheduledFor: "desc" },
            include: {
                artist: true,
                genre: true,
                _count: { select: { likedBy: true } },
            },
            skip,
            take: pageSize,
        }),
        prisma.podcast.count({ where }),
    ])

    // Get user's liked podcasts
    let likedPodcastIds = new Set<string>()
    if (userId) {
        const userLikes = await prisma.user.findUnique({
            where: { id: userId },
            select: { likedPodcasts: { select: { id: true } } },
        })
        if (userLikes) {
            likedPodcastIds = new Set(userLikes.likedPodcasts.map((p: { id: string }) => p.id))
        }
    }

    const podcasts = podcastsRaw.map(podcast => ({
        ...podcast,
        likesCount: podcast._count.likedBy,
        isLiked: likedPodcastIds.has(podcast.id),
    }))

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
        podcasts,
        totalCount,
        totalPages,
        currentPage: page,
    }
}

export async function getLikedPodcasts(userId: string) {
    return await prisma.podcast.findMany({
        where: {
            likedBy: {
                some: {
                    id: userId,
                },
            },
        },
        include: {
            artist: true,
            genre: true,
            _count: {
                select: {
                    likedBy: true
                }
            }
        },
        orderBy: { createdAt: "desc" },
    })
}

export async function getPodcast(id: string) {
    return await prisma.podcast.findUnique({
        where: { id },
        include: {
            artist: true,
            genre: true,
        },
    })
}

export async function getPodcastBySlug(slug: string) {
    return await prisma.podcast.findUnique({
        where: { slug },
        include: {
            artist: true,
            genre: true,
            _count: { select: { likedBy: true } },
        },
    })
}

export async function getRelatedPodcasts(currentId: string, genreId?: string | null, limit: number = 4) {
    if (!genreId) return []

    const podcasts = await prisma.podcast.findMany({
        where: {
            genreId,
            id: { not: currentId },
            deletedAt: null,
            scheduledFor: { lte: new Date() }
        },
        include: {
            artist: true,
            genre: true,
            _count: { select: { likedBy: true } },
        },
        orderBy: { scheduledFor: 'desc' },
        take: limit
    })

    return podcasts.map(podcast => ({
        ...podcast,
        likesCount: podcast._count.likedBy,
        isLiked: false, // For list view, we might not need auth check or can add it if needed
    }))
}

import { fromZonedTime } from "date-fns-tz"

// ... imports

export async function createPodcast(formData: FormData) {

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const artistId = formData.get("artistId") as string // Changed from host
    const genreId = formData.get("genreId") as string
    const type = (formData.get("type") as string) || "Warm"
    const sequence = parseInt(formData.get("sequence") as string || "0")
    // Checkbox returns "on" if checked, but explicit passing "true" works too.
    // Our form might send "on" or nothing if using standard form submit, or we might manipulate it.
    // The previous implementation used standard form submission.
    // Let's assume standard behavior: "on" if checked, null if not.
    // BUT in EditForm we explicitly set it to "true"/"false".
    // In CreateForm (New), we used <Switch name="isFeatured">.
    const isFeaturedRaw = formData.get("isFeatured")
    const isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "on"
    const timeZone = (formData.get("timeZone") as string) || "Asia/Colombo"
    const scheduledForStr = formData.get("scheduledFor") as string

    // Check for pre-uploaded URLs
    const audioUrlFromForm = formData.get("audioUrl") as string
    const imageUrlFromForm = formData.get("imageUrl") as string

    // Fallback to file objects (though client should handle upload now)
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !description || !artistId) {
        throw new Error("Title, Description, and Artist are required")
    }

    // Ensure we have audio (either URL or File)
    if (!audioUrlFromForm && (!audioFile || audioFile.size === 0)) {
        throw new Error("Audio file is required")
    }

    try {
        // Fetch artist to use slug for file paths
        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            select: { slug: true }
        })

        if (!artist) {
            throw new Error("Invalid artist selected")
        }

        // Generate unique slug from title
        const baseSlug = generateSlug(title)
        const slug = await ensureUniqueSlug(baseSlug)

        // Handle Audio Upload (Server-side fallback)
        let audioUrl = audioUrlFromForm
        if (!audioUrl && audioFile) {
            // Validate file sizes if files are provided directly
            const MAX_AUDIO_SIZE = 150 * 1024 * 1024 // 150MB
            if (audioFile.size > MAX_AUDIO_SIZE) {
                throw new Error(`Audio file is too large. Maximum size is 150MB.`)
            }
            audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS, artist.slug)
        }

        // Handle Image Upload (Server-side fallback)
        let imageUrl = imageUrlFromForm || null
        if (!imageUrl && imageFile && imageFile.size > 0) {
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB
            if (imageFile.size > MAX_IMAGE_SIZE) {
                throw new Error(`Image file is too large. Maximum size is 10MB.`)
            }
            imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS, artist.slug)
        }

        const scheduledFor = scheduledForStr ? fromZonedTime(scheduledForStr, timeZone) : new Date()

        const podcast = await prisma.podcast.create({
            data: {
                title,
                slug,
                description,
                artistId,
                genreId: genreId || null,
                type,
                sequence,
                isFeatured,
                audioUrl,
                imageUrl,
                scheduledFor,
                timeZone,
            },
        })

        // Generate waveform peaks asynchronously
        if (audioUrl) {
            let audioFilePath: string

            // Determine if it's a local file (legacy) or S3/Proxy URL
            if (audioUrl.startsWith('/s3-storage') || audioUrl.startsWith('http')) {
                audioFilePath = audioUrl
            } else {
                const cleanAudioUrl = audioUrl.startsWith('/api/') ? audioUrl.replace('/api/', '/') : audioUrl
                audioFilePath = path.join(process.cwd(), 'public', cleanAudioUrl)
            }

            console.log(`[WAVEFORM] Starting peak generation for podcast ${podcast.id}`)

            generateWaveformPeaks(audioFilePath, 1000)
                .then(async (peaks) => {
                    if (peaks) {
                        await prisma.podcast.update({
                            where: { id: podcast.id },
                            data: { waveformPeaks: peaks },
                        })
                        console.log(`[WAVEFORM] ✅ Peaks saved for podcast: ${podcast.id}`)
                    }
                })
                .catch(err => console.error(`[WAVEFORM] ❌ Failed podcast peaks: ${err}`))
        }

        revalidatePath("/admin/podcasts")
    } catch (error) {
        console.error("Failed to create podcast:", error)
        throw new Error(`Failed to create podcast: ${error}`)
    }

    // Redirect outside try-catch
    redirect("/admin/podcasts")
}

export async function updatePodcast(id: string, formData: FormData) {
    try {
        const title = formData.get("title") as string
        const description = formData.get("description") as string
        const artistId = formData.get("artistId") as string
        const genreId = formData.get("genreId") as string
        const type = (formData.get("type") as string) || "Warm"
        const sequence = parseInt(formData.get("sequence") as string || "0")
        const isFeaturedRaw = formData.get("isFeatured")
        const isFeatured = isFeaturedRaw === "true" || isFeaturedRaw === "on"
        const timeZone = (formData.get("timeZone") as string) || "Asia/Colombo"
        const scheduledForStr = formData.get("scheduledFor") as string
        const audioFile = formData.get("audioFile") as File
        const imageFile = formData.get("imageFile") as File

        // Pre-existing audio/image URLs from form (if client-side upload was used)
        const audioUrlFromForm = formData.get("audioUrl") as string
        const imageUrlFromForm = formData.get("imageUrl") as string

        if (!title || !description || !artistId) {
            return { success: false, message: "Title, Description, and Artist are required" }
        }

        const scheduledFor = scheduledForStr ? fromZonedTime(scheduledForStr, timeZone) : undefined

        const data: Prisma.PodcastUncheckedUpdateInput = {
            title,
            description,
            artistId,
            genreId: genreId || null,
            type,
            sequence,
            isFeatured,
            timeZone,
            ...(scheduledFor && { scheduledFor }),
        }

        const artist = await prisma.artist.findUnique({
            where: { id: artistId },
            select: { slug: true }
        })

        if (!artist) {
            return { success: false, message: "Invalid artist selected" }
        }

        // Get current podcast to check if title changed
        const currentPodcast = await prisma.podcast.findUnique({
            where: { id },
            select: { title: true, audioUrl: true } // Also get audioUrl to pass to waveform generation if not updated
        })

        // Regenerate slug if title changed
        if (currentPodcast && currentPodcast.title !== title) {
            const baseSlug = generateSlug(title)
            data.slug = await ensureUniqueSlug(baseSlug, id)
        }

        // Handle Audio Upload
        if (audioFile && audioFile.size > 0) {
            const MAX_AUDIO_SIZE = 150 * 1024 * 1024
            if (audioFile.size > MAX_AUDIO_SIZE) {
                return { success: false, message: `Audio file is too large. Maximum size is 150MB.` }
            }
            data.audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS, artist.slug)
        } else if (audioUrlFromForm) {
            // If no new file, but a URL was passed (e.g., from client-side upload)
            data.audioUrl = audioUrlFromForm
        } else {
            // If no new file and no URL from form, retain existing audioUrl
            // This is important if the user didn't touch the audio file input
            if (currentPodcast?.audioUrl) {
                data.audioUrl = currentPodcast.audioUrl
            }
        }


        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            const MAX_IMAGE_SIZE = 10 * 1024 * 1024
            if (imageFile.size > MAX_IMAGE_SIZE) {
                return { success: false, message: `Image file is too large. Maximum size is 10MB.` }
            }
            data.imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS, artist.slug)
        } else if (imageUrlFromForm) {
            data.imageUrl = imageUrlFromForm
        }

        await prisma.podcast.update({
            where: { id },
            data,
        })

        // Generate waveforms if audio updated
        if (typeof data.audioUrl === 'string') {
            let audioFilePath: string
            const audioUrl = data.audioUrl

            if (audioUrl.startsWith('/s3-storage') || audioUrl.startsWith('http')) {
                audioFilePath = audioUrl
            } else {
                const cleanAudioUrl = audioUrl.startsWith('/api/') ? audioUrl.replace('/api/', '/') : audioUrl
                audioFilePath = path.join(process.cwd(), 'public', cleanAudioUrl)
            }

            generateWaveformPeaks(audioFilePath, 1000)
                .then(async (peaks) => {
                    if (peaks) {
                        await prisma.podcast.update({
                            where: { id },
                            data: { waveformPeaks: peaks },
                        })
                        console.log(`[WAVEFORM] ✅ Peaks updated for podcast: ${id}`)
                    }
                })
                .catch(err => console.error(`[WAVEFORM] ❌ Failed podcast peaks: ${err}`))
        }

        revalidatePath("/admin/podcasts")
        return { success: true }
    } catch (error) {
        console.error("Failed to update podcast:", error)
        return { success: false, message: `Failed to update podcast: ${error instanceof Error ? error.message : "Unknown error"}` }
    }
}

export async function deletePodcast(id: string) {
    try {
        await prisma.podcast.update({
            where: { id },
            data: { deletedAt: new Date() }
        })
        revalidatePath("/admin/podcasts")
        revalidatePath("/admin/podcasts/trash")
    } catch (error) {
        console.error("Failed to delete podcast:", error)
        throw new Error("Failed to delete podcast")
    }
}

export async function restorePodcast(id: string) {
    try {
        await prisma.podcast.update({
            where: { id },
            data: { deletedAt: null }
        })
        revalidatePath("/admin/podcasts")
        revalidatePath("/admin/podcasts/trash")
    } catch (error) {
        console.error("Failed to restore podcast:", error)
        throw new Error("Failed to restore podcast")
    }
}

export async function permanentDeletePodcast(id: string) {
    try {
        await prisma.podcast.delete({
            where: { id },
        })
        revalidatePath("/admin/podcasts/trash")
    } catch (error) {
        console.error("Failed to permanently delete podcast:", error)
        throw new Error("Failed to permanently delete podcast")
    }
}

export async function getTrashedPodcasts() {
    return await prisma.podcast.findMany({
        where: {
            deletedAt: { not: null }
        },
        include: {
            artist: true,
            genre: true,
        },
        orderBy: { deletedAt: "desc" },
    })
}

export async function setFeaturedPodcast(id: string) {
    try {
        // Unset all featured podcasts
        await prisma.podcast.updateMany({
            where: { isFeatured: true },
            data: { isFeatured: false },
        })

        // Unset all featured tracks (Shared exclusivity)
        await prisma.track.updateMany({
            where: { isFeatured: true },
            data: { isFeatured: false },
        })

        // Set the new featured podcast
        await prisma.podcast.update({
            where: { id },
            data: { isFeatured: true },
        })

        revalidatePath("/admin/podcasts")
        revalidatePath("/admin/tracks")
        revalidatePath("/")
    } catch (error) {
        console.error("Failed to set featured podcast:", error)
        throw new Error("Failed to set featured podcast")
    }
}
