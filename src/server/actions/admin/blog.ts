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

async function ensureUniqueCategorySlug(baseSlug: string, excludeId?: string): Promise<string> {
    let slug = baseSlug
    let counter = 1

    while (true) {
        const existing = await prisma.category.findUnique({
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

export async function createCategory(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
        throw new Error("Name is required")
    }

    const baseSlug = generateSlug(name)
    const slug = await ensureUniqueCategorySlug(baseSlug)

    await prisma.category.create({
        data: {
            name,
            slug,
            description: description || null,
        }
    })

    revalidatePath("/admin/blog/categories")
    redirect("/admin/blog/categories")
}

export async function updateCategory(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string

    if (!name) {
        throw new Error("Name is required")
    }

    const currentCategory = await prisma.category.findUnique({
        where: { id },
        select: { name: true }
    })

    let slug: string | undefined
    if (currentCategory && currentCategory.name !== name) {
        const baseSlug = generateSlug(name)
        slug = await ensureUniqueCategorySlug(baseSlug, id)
    }

    await prisma.category.update({
        where: { id },
        data: {
            name,
            ...(slug && { slug }),
            description: description || null,
        }
    })

    revalidatePath("/admin/blog/categories")
    redirect("/admin/blog/categories")
}

export async function deleteCategory(id: string) {
    // Check if category has posts
    const category = await prisma.category.findUnique({
        where: { id },
        include: {
            _count: {
                select: { posts: true }
            }
        }
    })

    if (category && category._count.posts > 0) {
        throw new Error(`Cannot delete category with ${category._count.posts} associated posts`)
    }

    await prisma.category.delete({ where: { id } })
    revalidatePath("/admin/blog/categories")
}
