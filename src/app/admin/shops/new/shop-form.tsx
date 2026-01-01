"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { createShop } from "@/server/actions/admin/shop"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"

export default function ShopForm() {
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        if (imageUrl) {
            formData.set("imageUrl", imageUrl)
        }

        startTransition(async () => {
            await createShop(formData)
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
                <h1 className="text-2xl font-bold tracking-tight">Create Shop</h1>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Shop Name</Label>
                        <Input id="name" name="name" required placeholder="e.g. Rave Gear LK" disabled={isPending} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Store details..."
                            className="min-h-[100px]"
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" placeholder="e.g. Colombo 07" disabled={isPending} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Profile Image</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={setImageUrl}
                            disabled={isPending}
                            folder="shops"
                            helperText="Max 2MB"
                        />
                        <input type="hidden" name="imageUrl" value={imageUrl} />
                    </div>

                    <div className="grid gap-4 p-4 border rounded-lg">
                        <h3 className="font-medium">Contact Info</h3>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" name="email" type="email" placeholder="shop@example.com" disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" name="phone" placeholder="+94..." disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="website">Website</Label>
                            <Input id="website" name="website" placeholder="https://..." disabled={isPending} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border p-4 rounded-lg bg-secondary/10">
                        <Switch id="isVerified" name="isVerified" disabled={isPending} />
                        <Label htmlFor="isVerified" className="cursor-pointer">Mark as Verified Store</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild disabled={isPending}>
                        <Link href="/admin/shops">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Creating..." : "Create Shop"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
