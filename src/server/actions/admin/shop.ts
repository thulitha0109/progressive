"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createShop(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const imageUrl = formData.get("imageUrl") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const website = formData.get("website") as string
    const isVerified = formData.get("isVerified") === "on"

    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

    try {
        await prisma.shop.create({
            data: {
                name,
                slug,
                description: description || null,
                location: location || null,
                imageUrl: imageUrl || null,
                contactInfo: {
                    email,
                    phone,
                    website
                },
                isVerified,
            }
        })
    } catch (error) {
        console.error("Failed to create shop:", error)
        return { error: "Failed to create shop" }
    }

    revalidatePath("/admin/shops")
    revalidatePath("/shops")
    redirect("/admin/shops")
}

export async function deleteShop(id: string) {
    try {
        await prisma.shop.delete({ where: { id } })
    } catch (error) {
        console.error("Failed to delete shop:", error)
        return { error: "Failed to delete shop" }
    }

    revalidatePath("/admin/shops")
    revalidatePath("/shops")
}

export async function updateShop(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const location = formData.get("location") as string
    const imageUrl = formData.get("imageUrl") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const website = formData.get("website") as string
    const isVerified = formData.get("isVerified") === "on"

    try {
        await prisma.shop.update({
            where: { id },
            data: {
                name,
                description: description || null,
                location: location || null,
                imageUrl: imageUrl || null,
                contactInfo: {
                    email,
                    phone,
                    website
                },
                isVerified,
            }
        })
    } catch (error) {
        console.error("Failed to update shop:", error)
        return { error: "Failed to update shop" }
    }

    revalidatePath("/admin/shops")
    revalidatePath("/shops")
    revalidatePath(`/shops`, 'layout') // Revalidate general shops cache
    redirect("/admin/shops")
}
