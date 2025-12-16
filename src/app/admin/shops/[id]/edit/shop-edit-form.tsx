"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateShop } from "@/server/actions/admin/shop"

type ShopWithDetails = {
    id: string
    name: string
    description: string | null
    location: string | null
    imageUrl: string | null
    isVerified: boolean
    contactInfo: any
}

export function ShopEditForm({ shop }: { shop: ShopWithDetails }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState(shop.imageUrl || "")
    const contactInfo = shop.contactInfo || {}

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            formData.set("imageUrl", imageUrl)
            await updateShop(shop.id, formData)
            router.refresh()
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/shops">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Edit Shop</h1>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Shop Name</Label>
                        <Input id="name" name="name" defaultValue={shop.name} required />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            defaultValue={shop.description || ""}
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" defaultValue={shop.location || ""} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Profile Image</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={setImageUrl}
                            folder="shops"
                        />
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                    </div>

                    <div className="grid gap-4 p-4 border rounded-lg">
                        <h3 className="font-medium">Contact Info</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" defaultValue={contactInfo.email || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" defaultValue={contactInfo.phone || ""} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" name="website" defaultValue={contactInfo.website || ""} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border p-4 rounded-lg bg-secondary/10">
                        <Switch id="isVerified" name="isVerified" defaultChecked={shop.isVerified} />
                        <Label htmlFor="isVerified" className="cursor-pointer">Mark as Verified Store</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Updating..." : "Update Shop"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
