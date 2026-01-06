"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleLike(trackId: string) {
    const session = await auth()

    const userId = session?.user?.id

    if (!userId) {
        return { error: "Unauthorized" }
    }

    try {
        // Verify track exists
        const track = await prisma.track.findUnique({
            where: { id: trackId }
        })

        if (!track) {
            return { error: "Track not found" }
        }

        // Verify user exists (important after database resets)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                likes: {
                    where: { id: trackId }
                }
            }
        })

        if (!user) {
            // User session is stale - force re-authentication
            return { error: "Session expired. Please log out and log back in." }
        }

        const isLiked = user.likes.length > 0

        if (isLiked) {
            // Unlike
            await prisma.user.update({
                where: { id: userId },
                data: {
                    likes: {
                        disconnect: { id: trackId }
                    }
                }
            })
        } else {
            // Like
            await prisma.user.update({
                where: { id: userId },
                data: {
                    likes: {
                        connect: { id: trackId }
                    }
                }
            })
        }

        revalidatePath("/")
        revalidatePath("/profile")
        revalidatePath("/tracks")

        return { success: true }
    } catch (error: any) {
        console.error("Toggle like error:", error)
        return { error: "Failed to toggle like. Please try again." }
    }
}

export async function togglePodcastLike(podcastId: string) {
    const session = await auth()

    const userId = session?.user?.id

    if (!userId) {
        return { error: "Unauthorized" }
    }

    try {
        // Verify podcast exists
        const podcast = await prisma.podcast.findUnique({
            where: { id: podcastId }
        })

        if (!podcast) {
            return { error: "Podcast not found" }
        }

        // Verify user exists
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                likedPodcasts: {
                    where: { id: podcastId }
                }
            }
        })

        if (!user) {
            return { error: "Session expired. Please log out and log back in." }
        }

        const isLiked = user.likedPodcasts.length > 0

        if (isLiked) {
            // Unlike
            await prisma.user.update({
                where: { id: userId },
                data: {
                    likedPodcasts: {
                        disconnect: { id: podcastId }
                    }
                }
            })
        } else {
            // Like
            await prisma.user.update({
                where: { id: userId },
                data: {
                    likedPodcasts: {
                        connect: { id: podcastId }
                    }
                }
            })
        }

        revalidatePath("/")
        revalidatePath("/podcasts")
        revalidatePath("/profile")
        revalidatePath("/tracks") // Just in case

        return { success: true }
    } catch (error: any) {
        console.error("Toggle podcast like error:", error)
        return { error: "Failed to toggle like. Please try again." }
    }
}
