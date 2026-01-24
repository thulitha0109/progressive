"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

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
        const existing = await prisma.artist.findUnique({
            where: { slug },
            select: { id: true }
        })

        // If no existing artist has this slug, or it's the artist we're updating, it's unique
        if (!existing || (excludeId && existing.id === excludeId)) {
            return slug
        }

        // Try next variant
        counter++
        slug = `${baseSlug}-${counter}`
    }
}

export async function getArtists(
    page: number = 1,
    pageSize: number = 12, // Increased page size
    search?: string,
    sort: 'a-z' | 'z-a' | 'popular' | 'newest' = 'newest'
) {
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { bio: { contains: search, mode: 'insensitive' } },
        ]
    }

    let orderBy: any = {}
    switch (sort) {
        case 'a-z':
            orderBy = { name: 'asc' }
            break
        case 'z-a':
            orderBy = { name: 'desc' }
            break
        case 'popular':
            orderBy = { followers: { _count: 'desc' } }
            break
        case 'newest':
            orderBy = { createdAt: 'desc' }
            break
        default:
            orderBy = { createdAt: 'desc' }
    }

    const [artists, totalCount] = await Promise.all([
        prisma.artist.findMany({
            where,
            orderBy,
            skip,
            take: pageSize,
            include: {
                _count: {
                    select: { followers: true, tracks: true, podcasts: true }
                }
            }
        }),
        prisma.artist.count({ where }),
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
    const youtube = formData.get("youtube") as string
    const mixcloud = formData.get("mixcloud") as string
    const soundcloud = formData.get("soundcloud") as string

    const facebook = formData.get("facebook") as string
    const tiktok = formData.get("tiktok") as string

    if (!name || !bio) {
        throw new Error("Name and Bio are required")
    }

    const socialLinks = {
        instagram,
        youtube,
        mixcloud,
        soundcloud,
        facebook,
        tiktok,
    }

    // Generate unique slug from name
    const baseSlug = generateSlug(name)
    const slug = await ensureUniqueSlug(baseSlug)

    await prisma.artist.create({
        data: {
            name,
            slug,
            bio,
            imageUrl,
            socialLinks,
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
            _count: { select: { followers: true, tracks: true, podcasts: true } },
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

    const now = new Date()
    const tracks = artist.tracks.map((track: any) => ({
        ...track,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
        isReleased: new Date(track.scheduledFor) <= now,
    }))

    const isFollowing = userId ? (await prisma.user.count({
        where: {
            id: userId,
            followedArtists: {
                some: { id: artist.id }
            }
        }
    })) > 0 : false

    return { ...artist, tracks, isFollowing }
}

export async function getArtistBySlug(slug: string) {
    const session = await auth()
    const userId = session?.user?.id

    const artist = await prisma.artist.findUnique({
        where: { slug },
        include: {
            _count: { select: { followers: true, tracks: true, podcasts: true } },
            tracks: {
                orderBy: { scheduledFor: "desc" },
                include: {
                    _count: { select: { likedBy: true } },
                },
            },
            podcasts: {
                orderBy: { scheduledFor: "desc" },
                include: {
                    _count: { select: { likedBy: true } },
                    genre: {
                        include: {
                            parent: true
                        }
                    },
                    artist: true
                }
            }
        },
    })

    if (!artist) return null

    let likedTrackIds = new Set<string>()
    let likedPodcastIds = new Set<string>()

    if (userId) {
        const userLikes = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                likes: { select: { id: true } },
                likedPodcasts: { select: { id: true } }
            },
        })
        if (userLikes) {
            likedTrackIds = new Set(userLikes.likes.map((t: { id: string }) => t.id))
            likedPodcastIds = new Set(userLikes.likedPodcasts.map((p: { id: string }) => p.id))
        }
    }

    const now = new Date()
    const tracks = artist.tracks.map((track: any) => ({
        ...track,
        likesCount: track._count.likedBy,
        isLiked: likedTrackIds.has(track.id),
        isReleased: new Date(track.scheduledFor) <= now,
    }))

    const podcasts = artist.podcasts.map((podcast: any) => ({
        ...podcast,
        likesCount: podcast._count.likedBy,
        isLiked: likedPodcastIds.has(podcast.id),
        genreRel: podcast.genre,
        isReleased: new Date(podcast.scheduledFor) <= now,
    }))

    const isFollowing = userId ? (await prisma.user.count({
        where: {
            id: userId,
            followedArtists: {
                some: { id: artist.id }
            }
        }
    })) > 0 : false

    return { ...artist, tracks, podcasts, isFollowing }
}

export async function updateArtist(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const bio = formData.get("bio") as string
    const imageUrl = formData.get("imageUrl") as string
    const instagram = formData.get("instagram") as string
    const youtube = formData.get("youtube") as string
    const mixcloud = formData.get("mixcloud") as string
    const soundcloud = formData.get("soundcloud") as string

    const facebook = formData.get("facebook") as string
    const tiktok = formData.get("tiktok") as string

    if (!name || !bio) {
        throw new Error("Name and Bio are required")
    }

    const socialLinks = {
        instagram,
        youtube,
        mixcloud,
        soundcloud,
        facebook,
        tiktok,
    }

    // Get current artist to check if name changed
    const currentArtist = await prisma.artist.findUnique({
        where: { id },
        select: { name: true }
    })

    // Regenerate slug if name changed
    let slug: string | undefined
    if (currentArtist && currentArtist.name !== name) {
        const baseSlug = generateSlug(name)
        slug = await ensureUniqueSlug(baseSlug, id)
    }

    await prisma.artist.update({
        where: { id },
        data: {
            name,
            ...(slug && { slug }), // Only update slug if name changed
            bio,
            imageUrl,
            socialLinks,
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

export async function getFollowedArtists() {
    const session = await auth()
    if (!session?.user?.id) return []

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: {
            followedArtists: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    imageUrl: true,
                }
            }
        }
    })

    return user?.followedArtists || []
}
