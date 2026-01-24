"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { unstable_cache } from "next/cache"

import { Prisma } from "@prisma/client"

export async function getHomeData(sort: 'a-z' | 'z-a' | 'popular' | 'newest' = 'popular') {
    const session = await auth()
    const userId = session?.user?.id


    // ... (keep existing code)

    let artistOrderBy: Prisma.ArtistOrderByWithRelationInput = {}
    switch (sort) {
        case 'a-z':
            artistOrderBy = { name: 'asc' }
            break
        case 'z-a':
            artistOrderBy = { name: 'desc' }
            break
        case 'popular':
            artistOrderBy = { followers: { _count: 'desc' } }
            break
        case 'newest':
            artistOrderBy = { createdAt: 'desc' }
            break
        default:
            artistOrderBy = { followers: { _count: 'desc' } }
    }

    // ...

    const getCachedArtists = unstable_cache(
        async (orderBy: Prisma.ArtistOrderByWithRelationInput) => prisma.artist.findMany({
            orderBy,
            take: 6,
            include: {
                _count: {
                    select: { followers: true, tracks: true, podcasts: true }
                }
            }
        }),
        ['home-artists-v2'],
        { tags: ['artists'], revalidate: 3600 }
    )

    const getCachedUpcomingTracks = unstable_cache(
        async () => prisma.track.findMany({
            where: { scheduledFor: { gt: new Date() }, deletedAt: null },
            select: {
                id: true, title: true, scheduledFor: true, timeZone: true, label: true, type: true,
                imageUrl: true, waveformPeaks: true,
                artist: { select: { name: true, slug: true, imageUrl: true } },
                genreRel: { select: { name: true } },
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "asc" },
            take: 5,
        }),
        ['home-upcoming-tracks-v2'],
        { tags: ['tracks'], revalidate: 60 }
    )

    const getCachedUpcomingPodcasts = unstable_cache(
        async () => prisma.podcast.findMany({
            where: { scheduledFor: { gt: new Date() }, deletedAt: null },
            select: {
                id: true, title: true, scheduledFor: true, timeZone: true, type: true, sequence: true, imageUrl: true, waveformPeaks: true,
                artist: { select: { name: true, slug: true, imageUrl: true } },
                genre: { select: { name: true } },
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "asc" },
            take: 5,
        }),
        ['home-upcoming-podcasts-v2'],
        { tags: ['podcasts'], revalidate: 60 }
    )

    const getCachedPublishedTracks = unstable_cache(
        async () => prisma.track.findMany({
            where: { scheduledFor: { lte: new Date() }, deletedAt: null },
            include: {
                artist: true,
                genreRel: { include: { parent: true } },
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "desc" },
            take: 12,
        }),
        ['home-published-tracks-v2'],
        { tags: ['tracks'], revalidate: 60 }
    )

    const getCachedPublishedPodcasts = unstable_cache(
        async () => prisma.podcast.findMany({
            where: { scheduledFor: { lte: new Date() }, deletedAt: null },
            include: {
                artist: true,
                genre: { include: { parent: true } },
                _count: { select: { likedBy: true } },
            },
            orderBy: { scheduledFor: "desc" },
            take: 12,
        }),
        ['home-published-podcasts-v2'],
        { tags: ['podcasts'], revalidate: 60 }
    )

    const getCachedFeaturedTrack = unstable_cache(
        async () => prisma.track.findFirst({
            where: { isFeatured: true, deletedAt: null },
            include: {
                artist: true,
                genreRel: { include: { parent: true } },
                _count: { select: { likedBy: true } },
            },
        }),
        ['home-featured-track-v2'],
        { tags: ['tracks'], revalidate: 60 }
    )

    const getCachedFeaturedPodcast = unstable_cache(
        async () => prisma.podcast.findFirst({
            where: { isFeatured: true, deletedAt: null },
            include: {
                artist: true,
                genre: { include: { parent: true } },
                _count: { select: { likedBy: true } },
            },
        }),
        ['home-featured-podcast-v2'],
        { tags: ['podcasts'], revalidate: 60 }
    )

    const getCachedBlogPosts = unstable_cache(
        async () => prisma.blogPost.findMany({
            where: { publishedAt: { not: null } },
            orderBy: { publishedAt: "desc" },
            take: 3,
            select: {
                id: true, title: true, slug: true, excerpt: true, content: true,
                coverImage: true, publishedAt: true,
            }
        }),
        ['home-blog-posts-v2'],
        { tags: ['blog'], revalidate: 3600 }
    )

    const [
        upcomingTracksRaw,
        upcomingPodcastsRaw,
        publishedTracksRaw,
        publishedPodcastsRaw,
        featuredTrackRaw,
        featuredPodcastRaw,
        artists,
        blogPosts,
    ] = await Promise.all([
        getCachedUpcomingTracks(),
        getCachedUpcomingPodcasts(),
        getCachedPublishedTracks(),
        getCachedPublishedPodcasts(),
        getCachedFeaturedTrack(),
        getCachedFeaturedPodcast(),
        getCachedArtists(artistOrderBy),
        getCachedBlogPosts(),
    ])

    let likedTrackIds = new Set<string>()
    let likedPodcastIds = new Set<string>()

    if (userId && typeof userId === 'string' && userId.length > 0) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    likes: { select: { id: true } },
                    likedPodcasts: { select: { id: true } }
                },
            })
            if (user) {
                likedTrackIds = new Set(user.likes.map((t: { id: string }) => t.id))
                likedPodcastIds = new Set(user.likedPodcasts.map((p: { id: string }) => p.id))
            }
        } catch (error) {
            console.error("[getHomeData] Error fetching user likes:", error)
        }
    }

    const upcomingTracks = upcomingTracksRaw.map((track) => ({
        ...track,
        kind: "TRACK" as const, // For internal distinction
        type: track.type, // Pass actual type (Remix, Bootleg, or null)
        genre: track.genreRel?.name, // Keep for backward compat
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const upcomingPodcasts = upcomingPodcastsRaw.map((podcast) => ({
        ...podcast,
        kind: "PODCAST" as const, // For internal distinction
        type: podcast.type, // Pass actual type (Warm, Drive, Peak)
        genreRel: podcast.genre,
        genre: podcast.genre?.name,
        likesCount: podcast._count.likedBy,
        isLiked: likedPodcastIds.has(podcast.id),
        sequence: podcast.sequence,
    }))

    // Combine and sort upcoming
    const allUpcoming = [...upcomingTracks, ...upcomingPodcasts]
        .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
        .slice(0, 8) // Take top 8

    const publishedTracks = publishedTracksRaw.map((track) => ({
        ...track,
        genre: track.genreRel?.name, // Keep for backward compat
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
    }))

    const newPodcasts = publishedPodcastsRaw.map((podcast) => ({
        ...podcast,
        kind: "PODCAST" as const, // For internal distinction
        type: podcast.type, // Pass actual type (Warm, Drive, Peak)
        genreRel: podcast.genre,
        genre: podcast.genre?.name,
        likesCount: podcast._count.likedBy,
        isLiked: likedPodcastIds.has(podcast.id),
        sequence: podcast.sequence,
    }))

    // Determine featured item (Track or Podcast)
    let featuredItem = null

    if (featuredTrackRaw) {
        featuredItem = {
            ...featuredTrackRaw,
            type: "TRACK" as const,
            likesCount: featuredTrackRaw._count.likedBy,
            isLiked: likedTrackIds.has(featuredTrackRaw.id),
            label: featuredTrackRaw.label,
        }
    } else if (featuredPodcastRaw) {
        featuredItem = {
            ...featuredPodcastRaw,
            type: "PODCAST" as const,
            genreRel: featuredPodcastRaw.genre,
            genre: featuredPodcastRaw.genre?.name,
            likesCount: featuredPodcastRaw._count.likedBy,
            isLiked: likedPodcastIds.has(featuredPodcastRaw.id),
            assignedSequence: featuredPodcastRaw.sequence,
        }
    }

    return { upcomingTracks: allUpcoming, publishedTracks, newPodcasts, featuredItem, artists, blogPosts }
}
