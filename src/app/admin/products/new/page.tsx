import ProductForm from "./product-form"
import { prisma } from "@/lib/prisma"

export default async function NewProductPage() {
    const shops = await prisma.shop.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true }
    })

    return <ProductForm shops={shops} />
}
