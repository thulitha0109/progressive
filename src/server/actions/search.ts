"use server"

import { prisma } from "@/lib/prisma"

export type SearchResult = {
    type: 'track' | 'artist' | 'blog' | 'event' | 'shop' | 'product'
    id: string
    title: string
    slug?: string
    image?: string | null
    subtitle?: string
    url: string
    audioUrl?: string
}

export async function globalSearch(query: string): Promise<SearchResult[]> {
    if (!query || query.length < 2) return []

    const [tracks, artists, blogs, events, shops, products] = await Promise.all([
        prisma.track.findMany({
            where: { title: { contains: query, mode: 'insensitive' } },
            take: 3,
            select: { id: true, title: true, imageUrl: true, audioUrl: true, artist: { select: { name: true } } }
        }),
        prisma.artist.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            take: 3,
            select: { id: true, name: true, slug: true, imageUrl: true }
        }),
        prisma.blogPost.findMany({
            where: { title: { contains: query, mode: 'insensitive' }, publishedAt: { not: null } },
            take: 3,
            select: { id: true, title: true, slug: true, coverImage: true }
        }),
        prisma.event.findMany({
            where: { title: { contains: query, mode: 'insensitive' } },
            take: 3,
            select: { id: true, title: true, slug: true, coverImage: true, date: true }
        }),
        prisma.shop.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            take: 3,
            select: { id: true, name: true, slug: true, imageUrl: true }
        }),
        prisma.product.findMany({
            where: { name: { contains: query, mode: 'insensitive' } },
            take: 3,
            select: { id: true, name: true, slug: true, images: true, price: true }
        })
    ])

    const results: SearchResult[] = [
        ...artists.map(a => ({
            type: 'artist' as const,
            id: a.id,
            title: a.name,
            slug: a.slug,
            image: a.imageUrl,
            subtitle: 'Artist',
            url: `/artists/${a.slug}`
        })),
        ...tracks.map(t => ({
            type: 'track' as const,
            id: t.id,
            title: t.title,
            image: t.imageUrl,
            subtitle: t.artist.name,
            url: `/tracks/${t.id}`,
            audioUrl: t.audioUrl
        })),
        ...events.map(e => ({
            type: 'event' as const,
            id: e.id,
            title: e.title,
            slug: e.slug,
            image: e.coverImage,
            subtitle: new Date(e.date).toLocaleDateString(),
            url: `/events/${e.slug}`
        })),
        ...shops.map(s => ({
            type: 'shop' as const,
            id: s.id,
            title: s.name,
            slug: s.slug,
            image: s.imageUrl,
            subtitle: 'Store',
            url: `/shops/${s.slug}`
        })),
        ...products.map(p => ({
            type: 'product' as const,
            id: p.id,
            title: p.name,
            slug: p.slug,
            image: p.images[0],
            subtitle: `LKR ${Number(p.price).toLocaleString()}`,
            url: `/shop/${p.slug}`
        })),
        ...blogs.map(b => ({
            type: 'blog' as const,
            id: b.id,
            title: b.title,
            slug: b.slug,
            image: b.coverImage,
            subtitle: 'Article',
            url: `/blog/${b.slug}`
        }))
    ]

    return results
}
