"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { startOfDay, subDays } from "date-fns"

export async function getUsers(
    page: number = 1,
    limit: number = 20,
    search: string = ""
) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    const skip = (page - 1) * limit
    const where = search ? {
        OR: [
            { name: { contains: search, mode: "insensitive" as const } },
            { email: { contains: search, mode: "insensitive" as const } },
        ]
    } : {}

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
    ])

    return { users, total, totalPages: Math.ceil(total / limit) }
}

export async function getUser(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    return prisma.user.findUnique({
        where: { id },
    })
}

export async function updateUser(id: string, data: { name?: string, role?: string }) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    await prisma.user.update({
        where: { id },
        data: {
            name: data.name,
            role: data.role as any, // Using any here to bypass Enum typing for simplicity, or import Enum
        },
    })

    revalidatePath("/admin/users")
    revalidatePath(`/admin/users/${id}/edit`)
}

export async function deleteUser(id: string) {
    const session = await auth()
    if (session?.user?.role !== "ADMIN") {
        throw new Error("Unauthorized")
    }

    try {
        await prisma.user.delete({
            where: { id },
        })
        revalidatePath("/admin/users")
        return { success: true }
    } catch (error) {
        return { error: "Failed to delete user. They might be referenced elsewhere." }
    }
}
