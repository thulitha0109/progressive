"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"

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

export async function getPodcasts(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize

    const [podcasts, totalCount] = await Promise.all([
        prisma.podcast.findMany({
            where: { deletedAt: null },
            orderBy: { scheduledFor: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.podcast.count({ where: { deletedAt: null } }),
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
        podcasts,
        totalCount,
        totalPages,
        currentPage: page,
    }
}

export async function getPodcast(id: string) {
    return await prisma.podcast.findUnique({
        where: { id },
    })
}

export async function createPodcast(formData: FormData) {

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const host = formData.get("host") as string
    const scheduledForStr = formData.get("scheduledFor") as string

    // Check for pre-uploaded URLs
    const audioUrlFromForm = formData.get("audioUrl") as string
    const imageUrlFromForm = formData.get("imageUrl") as string

    // Fallback to file objects (though client should handle upload now)
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    console.log("Podcast Data:", {
        title,
        description,
        host,
        scheduledForStr,
        audioUrl: audioUrlFromForm,
        imageUrl: imageUrlFromForm
    })

    if (!title || !description || !host) {
        console.error("Missing required fields for podcast")
        throw new Error("Title, Description, and Host are required")
    }

    // Ensure we have audio (either URL or File)
    if (!audioUrlFromForm && (!audioFile || audioFile.size === 0)) {
        throw new Error("Audio file is required")
    }

    // Validate file sizes if files are provided directly (server-side upload fallback)
    const MAX_AUDIO_SIZE = 50 * 1024 * 1024 // 50MB
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024 // 10MB

    if (audioFile && audioFile.size > MAX_AUDIO_SIZE) {
        throw new Error(`Audio file is too large. Maximum size is 50MB. Your file is ${(audioFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    if (imageFile && imageFile.size > MAX_IMAGE_SIZE) {
        throw new Error(`Image file is too large. Maximum size is 10MB. Your file is ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`)
    }

    try {
        // Generate unique slug from title
        const baseSlug = generateSlug(title)
        const slug = await ensureUniqueSlug(baseSlug)

        // Generate host slug for file path
        const hostSlug = generateSlug(host)

        // Handle Audio Upload
        let audioUrl = audioUrlFromForm
        if (!audioUrl && audioFile) {
            audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS, hostSlug)
            console.log("Audio uploaded successfully (server-side):", audioUrl)
        }

        // Handle Image Upload
        let imageUrl = imageUrlFromForm || null
        if (!imageUrl && imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS, hostSlug)
            console.log("Image uploaded successfully (server-side):", imageUrl)
        }

        const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : new Date()

        await prisma.podcast.create({
            data: {
                title,
                slug,
                description,
                host,
                audioUrl,
                imageUrl,
                scheduledFor,
            },
        })

        revalidatePath("/admin/podcasts")
    } catch (error) {
        console.error("Failed to create podcast:", error)
        throw new Error(`Failed to create podcast: ${error}`)
    }

    // Redirect outside try-catch
    redirect("/admin/podcasts")
}

export async function updatePodcast(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const host = formData.get("host") as string
    const scheduledForStr = formData.get("scheduledFor") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !description || !host) {
        throw new Error("Title, Description, and Host are required")
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

    const scheduledFor = scheduledForStr ? new Date(scheduledForStr) : undefined

    const data: any = {
        title,
        description,
        host,
        ...(scheduledFor && { scheduledFor }),
    }

    try {
        // Get current podcast to check if title changed
        const currentPodcast = await prisma.podcast.findUnique({
            where: { id },
            select: { title: true }
        })

        // Regenerate slug if title changed
        if (currentPodcast && currentPodcast.title !== title) {
            const baseSlug = generateSlug(title)
            data.slug = await ensureUniqueSlug(baseSlug, id)
        }

        // Generate host slug for file path
        const hostSlug = generateSlug(host)

        // Handle Audio Upload
        if (audioFile && audioFile.size > 0) {
            data.audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS, hostSlug)
            console.log("Audio updated successfully:", data.audioUrl)
        }

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            data.imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS, hostSlug)
            console.log("Image updated successfully:", data.imageUrl)
        }

        await prisma.podcast.update({
            where: { id },
            data,
        })

        revalidatePath("/admin/podcasts")
    } catch (error) {
        console.error("Failed to update podcast:", error)
        throw new Error(`Failed to update podcast: ${error}`)
    }

    // Redirect outside try-catch
    redirect("/admin/podcasts")
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
        orderBy: { deletedAt: "desc" },
    })
}
