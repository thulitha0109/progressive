"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getArtists(page: number = 1, pageSize: number = 10) {
    const skip = (page - 1) * pageSize

    const [artists, totalCount] = await Promise.all([
        prisma.artist.findMany({
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
        prisma.artist.count(),
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
        artists,
        totalCount,
        totalPages,
        currentPage: page,
    }
}

export async function createArtist(formData: FormData) {
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const imageUrl = formData.get("imageUrl") as string
    const instagram = formData.get("instagram") as string
    const twitter = formData.get("twitter") as string
    const soundcloud = formData.get("soundcloud") as string

    if (!name || !bio) {
        throw new Error("Name and Bio are required")
    }

    const socialProfiles = JSON.stringify({
        instagram,
        twitter,
        soundcloud,
    })

    await prisma.artist.create({
        data: {
            name,
            bio,
            imageUrl,
            socialProfiles,
        },
    })

    revalidatePath("/admin/artists")
    redirect("/admin/artists")
}

import { auth } from "@/auth"

export async function getArtistById(id: string) {
    const session = await auth()
    const userId = session?.user?.id

    const artist = await prisma.artist.findUnique({
        where: { id },
        include: {
            tracks: {
                orderBy: { scheduledFor: "desc" },
                include: {
                    _count: { select: { likedBy: true } },
                },
            },
        },
    })

    if (!artist) return null

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

    const tracks = artist.tracks.map((track: any) => ({
        ...track,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    return { ...artist, tracks }
}

export async function updateArtist(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const imageUrl = formData.get("imageUrl") as string
    const instagram = formData.get("instagram") as string
    const twitter = formData.get("twitter") as string
    const soundcloud = formData.get("soundcloud") as string

    if (!name || !bio) {
        throw new Error("Name and Bio are required")
    }

    const socialProfiles = JSON.stringify({
        instagram,
        twitter,
        soundcloud,
    })

    await prisma.artist.update({
        where: { id },
        data: {
            name,
            bio,
            imageUrl,
            socialProfiles,
        },
    })

    revalidatePath("/admin/artists")
    redirect("/admin/artists")
}

export async function deleteArtist(id: string) {
    try {
        await prisma.artist.delete({
            where: { id },
        })
        revalidatePath("/admin/artists")
    } catch (error) {
        console.error("Failed to delete artist:", error)
        throw new Error("Failed to delete artist")
    }
}
