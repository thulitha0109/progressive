"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"

export async function getHomeData() {
    const session = await auth()
    const userId = session?.user?.id
    const now = new Date()

    const upcomingTracksPromise = prisma.track.findMany({
        where: {
            scheduledFor: { gt: now },
            deletedAt: null
        },
        include: {
            artist: true,
            genreRel: {
                include: {
                    parent: true
                }
            },
            _count: { select: { likedBy: true } },
        },
        orderBy: { scheduledFor: "asc" },
        take: 5,
    })

    const publishedTracksPromise = prisma.track.findMany({
        where: {
            scheduledFor: { lte: now },
            deletedAt: null
        },
        include: {
            artist: true,
            genreRel: {
                include: {
                    parent: true
                }
            },
            _count: { select: { likedBy: true } },
        },
        orderBy: { scheduledFor: "desc" },
        take: 12,
    })

    const featuredTrackPromise = prisma.track.findFirst({
        where: { isFeatured: true, deletedAt: null },
        include: {
            artist: true,
            genreRel: {
                include: {
                    parent: true
                }
            },
            _count: { select: { likedBy: true } },
        },
    })

    const artistsPromise = prisma.artist.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
    })

    const blogPostsPromise = prisma.blogPost.findMany({
        where: { publishedAt: { not: null } },
        orderBy: { publishedAt: "desc" },
        take: 3,
        select: {
            id: true,
            title: true,
            slug: true,
            excerpt: true,
            content: true,
            coverImage: true,
            publishedAt: true,
        }
    })

    const [
        upcomingTracksRaw,
        publishedTracksRaw,
        featuredTrackRaw,
        artists,
        blogPosts,
    ] = await Promise.all([
        upcomingTracksPromise,
        publishedTracksPromise,
        featuredTrackPromise,
        artistsPromise,
        blogPostsPromise,
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
        genre: track.genreRel?.name, // Keep for backward compat
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const publishedTracks = publishedTracksRaw.map((track: any) => ({
        ...track,
        genre: track.genreRel?.name, // Keep for backward compat
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const featuredTrack = featuredTrackRaw ? {
        ...featuredTrackRaw,
        likesCount: (featuredTrackRaw as any)._count.likedBy,
        isLiked: likedTrackIds.has(featuredTrackRaw.id),
    } : null

    return { upcomingTracks, publishedTracks, featuredTrack, artists, blogPosts }
}
