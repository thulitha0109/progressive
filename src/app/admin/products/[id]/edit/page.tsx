import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ProductEditForm } from "./product-edit-form"

export default async function EditProductPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [product, shops] = await Promise.all([
        prisma.product.findUnique({ where: { id } }),
        prisma.shop.findMany({ orderBy: { name: "asc" } })
    ])

    if (!product) {
        notFound()
    }

    const serializedProduct = {
        ...product,
        price: Number(product.price)
    }

    return <ProductEditForm product={serializedProduct} shops={shops} />
}
