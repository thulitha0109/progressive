"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function toggleFollowArtist(artistId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const userId = session.user.id

    const existingFollow = await prisma.user.findFirst({
        where: {
            id: userId,
            followedArtists: {
                some: {
                    id: artistId
                }
            }
        }
    })

    let isFollowing = false

    if (existingFollow) {
        // Unfollow
        await prisma.user.update({
            where: { id: userId },
            data: {
                followedArtists: {
                    disconnect: { id: artistId }
                }
            }
        })
        isFollowing = false
    } else {
        // Follow
        await prisma.user.update({
            where: { id: userId },
            data: {
                followedArtists: {
                    connect: { id: artistId }
                }
            }
        })
        isFollowing = true
    }

    revalidatePath(`/artists`)
    revalidatePath(`/artists/[slug]`, 'page')

    return { isFollowing }
}

export async function getArtistFollowStatus(artistId: string) {
    const session = await auth()
    if (!session?.user?.id) return { isFollowing: false }

    const existingFollow = await prisma.user.findFirst({
        where: {
            id: session.user.id,
            followedArtists: { some: { id: artistId } }
        },
        select: { id: true }
    })

    return { isFollowing: !!existingFollow }
}
