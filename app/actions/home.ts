"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getHomeData() {
    const session = await auth()
    const userId = session?.user?.id
    const now = new Date()

    const [upcomingTracksRaw, publishedTracksRaw, featuredTrackRaw, artists] = await Promise.all([
        prisma.track.findMany({
            where: {
                scheduledFor: { gt: now },
                deletedAt: null
            },
            include: {
                artist: true,
                genreRel: true,
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "asc" },
            take: 5,
        }),
        prisma.track.findMany({
            where: {
                scheduledFor: { lte: now },
                deletedAt: null
            },
            include: {
                artist: true,
                genreRel: true,
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "desc" },
            take: 12,
        }),
        prisma.track.findFirst({
            where: { isFeatured: true, deletedAt: null },
            include: {
                artist: true,
                genreRel: true,
                _count: { select: { likedBy: true } },
            },
        }),
        prisma.artist.findMany({
            orderBy: { createdAt: "desc" },
            take: 6,
        }),
    ])

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

    const upcomingTracks = upcomingTracksRaw.map((track: any) => ({
        ...track,
        genre: track.genreRel?.name,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const publishedTracks = publishedTracksRaw.map((track: any) => ({
        ...track,
        genre: track.genreRel?.name,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const featuredTrack = featuredTrackRaw ? {
        ...featuredTrackRaw,
        likesCount: (featuredTrackRaw as any)._count.likedBy,
        isLiked: likedTrackIds.has(featuredTrackRaw.id),
    } : null

    return { upcomingTracks, publishedTracks, featuredTrack, artists }
}
