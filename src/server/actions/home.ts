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

    const featuredPodcastPromise = prisma.podcast.findFirst({
        where: { isFeatured: true, deletedAt: null },
        include: {
            artist: true,
            genre: {
                include: {
                    parent: true
                }
            },
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
        featuredPodcastRaw,
        artists,
        blogPosts,
    ] = await Promise.all([
        upcomingTracksPromise,
        publishedTracksPromise,
        featuredTrackPromise,
        featuredPodcastPromise,
        artistsPromise,
        blogPostsPromise,
    ])

    let likedTrackIds = new Set<string>()

    if (userId && typeof userId === 'string' && userId.length > 0) {
        try {
            const userLikes = await prisma.user.findUnique({
                where: { id: userId },
                select: { likes: { select: { id: true } } },
            })
            if (userLikes) {
                likedTrackIds = new Set(userLikes.likes.map((t: { id: string }) => t.id))
            }
        } catch (error) {
            console.error("[getHomeData] Error fetching user likes:", error)
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

    // Determine featured item (Track or Podcast)
    let featuredItem = null

    if (featuredTrackRaw) {
        featuredItem = {
            ...featuredTrackRaw,
            type: "TRACK" as const,
            likesCount: (featuredTrackRaw as any)._count.likedBy,
            isLiked: likedTrackIds.has(featuredTrackRaw.id),
        }
    } else if (featuredPodcastRaw) {
        featuredItem = {
            ...featuredPodcastRaw,
            type: "PODCAST" as const,
            genreRel: (featuredPodcastRaw as any).genre,
            genre: (featuredPodcastRaw as any).genre?.name,
            // Podcasts don't have likes yet
            likesCount: 0,
            isLiked: false,
        }
    }

    return { upcomingTracks, publishedTracks, featuredItem, artists, blogPosts }
}
