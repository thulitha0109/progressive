"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { createProduct } from "@/server/actions/admin/product"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"

interface Shop {
    id: string
    name: string
}

export default function ProductForm({ shops }: { shops: Shop[] }) {
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        if (imageUrl) {
            formData.set("imageUrl", imageUrl)
        }

        startTransition(async () => {
            await createProduct(formData)
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
                <h1 className="text-2xl font-bold tracking-tight">Create Product</h1>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="shopId">Shop (Vendor)</Label>
                        <Select name="shopId" disabled={isPending}>
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
                        <Input id="name" name="name" required placeholder="e.g. Pioneer DJ Controller" disabled={isPending} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Product details..."
                            className="min-h-[100px]"
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="price">Price (LKR)</Label>
                            <Input id="price" name="price" type="number" required placeholder="0.00" disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="stock">Stock Quantity</Label>
                            <Input id="stock" name="stock" type="number" required placeholder="0" disabled={isPending} />
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Label>Product Image</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={setImageUrl}
                            disabled={isPending}
                            folder="products"
                        />
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild disabled={isPending}>
                        <Link href="/admin/products">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Creating..." : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
