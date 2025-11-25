"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createPodcast } from "@/app/actions/podcasts"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewPodcastPage() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await createPodcast(formData)
        } catch (error) {
            console.error(error)
            alert("Failed to create podcast")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">Add New Podcast</h1>
            <form action={onSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" required placeholder="Podcast Title" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="host">Host (Optional)</Label>
                    <Input id="host" name="host" placeholder="Host Name" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        name="description"
                        required
                        placeholder="Podcast description..."
                        className="min-h-[100px]"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="audioFile">Audio File</Label>
                    <Input
                        id="audioFile"
                        name="audioFile"
                        type="file"
                        accept="audio/*"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="imageFile">Cover Image (Optional)</Label>
                    <Input
                        id="imageFile"
                        name="imageFile"
                        type="file"
                        accept="image/*"
                    />
                </div>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Podcast"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
