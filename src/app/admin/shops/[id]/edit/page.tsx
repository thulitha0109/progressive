import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ShopEditForm, ShopWithDetails } from "./shop-edit-form"

export default async function EditShopPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const shop = await prisma.shop.findUnique({
        where: { id }
    })

    if (!shop) {
        notFound()
    }

    return <ShopEditForm shop={shop as unknown as ShopWithDetails} />
}
