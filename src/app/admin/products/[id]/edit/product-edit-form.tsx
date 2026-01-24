"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Trash } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateProduct } from "@/server/actions/admin/product"
import { Prisma } from "@prisma/client"
import Image from "next/image"

type Product = {
    id: string
    name: string
    description: string
    price: number
    stock: number
    images: string[]
    shopId: string | null
}

type Shop = {
    id: string
    name: string
}

export function ProductEditForm({ product, shops }: { product: Product, shops: Shop[] }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState<string[]>(product.images || [])

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            formData.delete("imageUrl") // Remove if present
            imageUrl.forEach(url => formData.append("images", url))
            await updateProduct(product.id, formData)
            router.refresh()
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/products">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Product</h1>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="shopId">Shop (Vendor)</Label>
                        <Select name="shopId" defaultValue={product.shopId || ""}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a shop" />
                            </SelectTrigger>
                            <SelectContent>
                                {shops.map(shop => (
                                    <SelectItem key={shop.id} value={shop.id}>{shop.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="name">Product Name</Label>
                        <Input id="name" name="name" defaultValue={product.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            defaultValue={product.description}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (LKR)</Label>
                            <Input id="price" name="price" type="number" defaultValue={Number(product.price)} required />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" name="stock" type="number" defaultValue={product.stock} required />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Product Images</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            {imageUrl.map((url, index) => (
                                <div key={url} className="relative group dark:bg-muted rounded-lg overflow-hidden border aspect-square">
                                    <Image
                                        src={url}
                                        alt={`Product image ${index + 1}`}
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                            const newImages = imageUrl.filter((_, i) => i !== index)
                                            setImageUrl(newImages)
                                        }}
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                    {index === 0 && (
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs py-1 text-center backdrop-blur-sm">
                                            Main Image
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="flex items-center justify-center border-2 border-dashed rounded-lg aspect-square bg-muted/5 p-4">
                                <ImageUpload
                                    onChange={(url) => setImageUrl([...imageUrl, url])}
                                    folder="products"
                                    className="w-full"
                                    helperText="Max 2MB"
                                />
                            </div>
                        </div>
                        {imageUrl.map((url) => (
                            <input key={url} type="hidden" name="images" value={url} />
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Updating..." : "Update Product"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
