"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function getGenres() {
    const genres = await prisma.genre.findMany({
        include: {
            parent: true,
            subGenres: true,
            _count: {
                select: { tracks: true }
            }
        },
        orderBy: {
            name: 'asc'
        }
    })
    return genres
}

export async function createGenre(formData: FormData) {
    const name = formData.get("name") as string
    const parentId = formData.get("parentId") as string

    if (!name) {
        throw new Error("Name is required")
    }

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')

    try {
        await prisma.genre.create({
            data: {
                name,
                slug,
                parentId: parentId || null
            }
        })
        revalidatePath("/admin/genres")
    } catch (error) {
        console.error("Failed to create genre:", error)
        throw new Error("Failed to create genre")
    }
}

export async function updateGenre(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const parentId = formData.get("parentId") as string

    if (!name) {
        throw new Error("Name is required")
    }

    const slug = name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')

    try {
        await prisma.genre.update({
            where: { id },
            data: {
                name,
                slug,
                parentId: parentId || null
            }
        })
        revalidatePath("/admin/genres")
    } catch (error) {
        console.error("Failed to update genre:", error)
        throw new Error("Failed to update genre")
    }
}

export async function deleteGenre(id: string) {
    try {
        await prisma.genre.delete({
            where: { id }
        })
        revalidatePath("/admin/genres")
    } catch (error) {
        console.error("Failed to delete genre:", error)
        throw new Error("Failed to delete genre")
    }
}
