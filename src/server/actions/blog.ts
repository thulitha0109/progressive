"use server"

import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export async function getBlogPosts(
    page: number = 1,
    pageSize: number = 10,
    status: 'published' | 'draft' | 'all' = 'published',
    categorySlug?: string
) {
    const skip = (page - 1) * pageSize

    const where: Prisma.BlogPostWhereInput = {}
    if (status === 'published') {
        where.publishedAt = { not: null }
    } else if (status === 'draft') {
        where.publishedAt = null
    }

    if (categorySlug) {
        where.category = {
            slug: categorySlug
        }
    }

    const [posts, totalCount] = await Promise.all([
        prisma.blogPost.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
            include: {
                author: { select: { name: true, image: true } },
                category: true,
            }
        }),
        prisma.blogPost.count({ where }),
    ])

    const totalPages = Math.ceil(totalCount / pageSize)

    return {
        posts,
        totalCount,
        totalPages,
        currentPage: page,
    }
}

export async function getBlogPostBySlug(slug: string) {
    return prisma.blogPost.findUnique({
        where: { slug },
        include: {
            author: { select: { name: true, image: true } },
            category: true,
            tags: true,
        }
    })
}

export async function getBlogPostById(id: string) {
    return prisma.blogPost.findUnique({
        where: { id },
        include: {
            category: true,
            tags: true,
        }
    })
}

export async function getCategories() {
    return prisma.category.findMany({
        orderBy: { name: 'asc' },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    })
}

export async function getCategoryById(id: string) {
    return prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    })
}
