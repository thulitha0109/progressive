"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { saveUploadedFile, UPLOAD_DIRS } from "@/lib/file-upload"

export async function getPodcasts(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize

    const [podcasts, totalCount] = await Promise.all([
        prisma.podcast.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.podcast.count(),
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
    console.log("createPodcast called")
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const host = formData.get("host") as string
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    console.log("Podcast Data:", {
        title,
        description,
        host,
        audioFile: audioFile ? { name: audioFile.name, size: audioFile.size, type: audioFile.type } : null,
        imageFile: imageFile ? { name: imageFile.name, size: imageFile.size, type: imageFile.type } : null
    })

    if (!title || !description || !audioFile || audioFile.size === 0) {
        console.error("Missing required fields for podcast")
        throw new Error("Title, Description, and Audio File are required")
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
        // Handle Audio Upload using centralized utility
        const audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS)
        console.log("Audio uploaded successfully:", audioUrl)

        // Handle Image Upload (Optional)
        let imageUrl = null
        if (imageFile && imageFile.size > 0) {
            imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS)
            console.log("Image uploaded successfully:", imageUrl)
        }

        await prisma.podcast.create({
            data: {
                title,
                description,
                host,
                audioUrl,
                imageUrl,
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
    const audioFile = formData.get("audioFile") as File
    const imageFile = formData.get("imageFile") as File

    if (!title || !description) {
        throw new Error("Title and Description are required")
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

    const data: any = {
        title,
        description,
        host,
    }

    try {
        // Handle Audio Upload
        if (audioFile && audioFile.size > 0) {
            data.audioUrl = await saveUploadedFile(audioFile, UPLOAD_DIRS.PODCASTS)
            console.log("Audio updated successfully:", data.audioUrl)
        }

        // Handle Image Upload
        if (imageFile && imageFile.size > 0) {
            data.imageUrl = await saveUploadedFile(imageFile, UPLOAD_DIRS.PODCASTS)
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
        await prisma.podcast.delete({
            where: { id },
        })
        revalidatePath("/admin/podcasts")
    } catch (error) {
        console.error("Failed to delete podcast:", error)
        throw new Error("Failed to delete podcast")
    }
}
