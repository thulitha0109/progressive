"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { auth } from "@/auth"

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

async function ensureUniqueSlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
        const existing = await prisma.blogPost.findUnique({
            where: { slug },
            select: { id: true }
        })

        if (!existing || (excludeId && existing.id === excludeId)) {
            return slug
        }

        counter++
        slug = `${baseSlug}-${counter}`
    }
}

export async function getBlogPosts(page: number = 1, pageSize: number = 10, status: 'published' | 'draft' | 'all' = 'published') {
    const skip = (page - 1) * pageSize

    const where: any = {}
    if (status === 'published') {
        where.publishedAt = { not: null }
    } else if (status === 'draft') {
        where.publishedAt = null
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

export async function createBlogPost(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) {
        throw new Error("Unauthorized")
    }

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const coverImage = formData.get("coverImage") as string | null
    const isPublished = formData.get("isPublished") === "on"
    const categoryId = formData.get("categoryId") as string

    if (!title || !content) {
        throw new Error("Title and Content are required")
    }

    const baseSlug = generateSlug(title)
    const slug = await ensureUniqueSlug(baseSlug)

    await prisma.blogPost.create({
        data: {
            title,
            slug,
            content,
            excerpt,
            coverImage: coverImage || null,
            authorId: session.user.id,
            publishedAt: isPublished ? new Date() : null,
            categoryId: categoryId || null,
        }
    })

    revalidatePath("/admin/blog")
    redirect("/admin/blog")
}

export async function updateBlogPost(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const coverImage = formData.get("coverImage") as string | null
    const isPublished = formData.get("isPublished") === "on"
    const categoryId = formData.get("categoryId") as string

    if (!title || !content) {
        throw new Error("Title and Content are required")
    }

    const currentPost = await prisma.blogPost.findUnique({
        where: { id },
        select: { title: true, publishedAt: true }
    })

    let slug: string | undefined
    if (currentPost && currentPost.title !== title) {
        const baseSlug = generateSlug(title)
        slug = await ensureUniqueSlug(baseSlug, id)
    }

    await prisma.blogPost.update({
        where: { id },
        data: {
            title,
            ...(slug && { slug }),
            content,
            excerpt,
            coverImage: coverImage || null,
            publishedAt: isPublished ? (currentPost?.publishedAt || new Date()) : null,
            categoryId: categoryId || null,
        }
    })

    revalidatePath("/admin/blog")
    redirect("/admin/blog")
}

export async function deleteBlogPost(id: string) {
    await prisma.blogPost.delete({ where: { id } })
    revalidatePath("/admin/blog")
}

export async function getCategories() {
    return prisma.category.findMany({ orderBy: { name: 'asc' } })
}
