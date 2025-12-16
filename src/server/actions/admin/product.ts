"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

export async function createProduct(formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const shopId = formData.get("shopId") as string
    const imageUrl = formData.get("imageUrl") as string
    const stock = formData.get("stock") as string

    // Simple slug generator
    const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

    try {
        await prisma.product.create({
            data: {
                name,
                slug,
                description,
                price: new Prisma.Decimal(price),
                shopId: shopId || null,
                stock: stock ? parseInt(stock) : 0,
                images: formData.getAll("images") as string[],
            }
        })
    } catch (error) {
        console.error("Failed to create product:", error)
        return { error: "Failed to create product" }
    }

    revalidatePath("/admin/products")
    revalidatePath("/shops")
    redirect("/admin/products")
}

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({ where: { id } })
    } catch (error) {
        console.error("Failed to delete product:", error)
        return { error: "Failed to delete product" }
    }

    revalidatePath("/admin/products")
    revalidatePath("/shops")
}

export async function updateProduct(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const shopId = formData.get("shopId") as string
    const imageUrl = formData.get("imageUrl") as string
    const stock = formData.get("stock") as string

    try {
        await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price: new Prisma.Decimal(price),
                shopId: shopId || null,
                stock: stock ? parseInt(stock) : 0,
                images: formData.getAll("images") as string[],
            }
        })
    } catch (error) {
        console.error("Failed to update product:", error)
        return { error: "Failed to update product" }
    }

    revalidatePath("/admin/products")
    revalidatePath("/shops")
    redirect("/admin/products")
}
