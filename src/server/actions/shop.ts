"use server"

import { prisma } from "@/lib/prisma"

export async function getShops() {
    return prisma.shop.findMany({
        orderBy: { name: "asc" },
        include: {
            products: {
                take: 3
            }
        }
    })
}

export async function getShopBySlug(slug: string) {
    return prisma.shop.findUnique({
        where: { slug },
        include: {
            products: true,
            reviews: {
                include: {
                    user: { select: { name: true, image: true } }
                }
            }
        }
    })
}

export async function getProducts() {
    return prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        include: {
            shop: { select: { name: true, slug: true } }
        }
    })
}

export async function getProductBySlug(slug: string) {
    return prisma.product.findUnique({
        where: { slug },
        include: {
            shop: true,
            reviews: {
                include: {
                    user: { select: { name: true, image: true } }
                }
            }
        }
    })
}
