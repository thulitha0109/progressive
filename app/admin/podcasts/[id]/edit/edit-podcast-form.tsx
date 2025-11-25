"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { updatePodcast } from "@/app/actions/podcasts"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface EditPodcastFormProps {
    podcast: {
        id: string
        title: string
        description: string
        host: string | null
    }
}

export default function EditPodcastForm({ podcast }: EditPodcastFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            await updatePodcast(podcast.id, formData)
        } catch (error) {
            console.error(error)
            alert("Failed to update podcast")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form action={onSubmit} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    name="title"
                    required
                    defaultValue={podcast.title}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="host">Host (Optional)</Label>
                <Input
                    id="host"
                    name="host"
                    defaultValue={podcast.host || ""}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={podcast.description}
                    className="min-h-[100px]"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File (Optional)</Label>
                <Input id="audioFile" name="audioFile" type="file" accept="audio/*" />
                <p className="text-xs text-muted-foreground">
                    Upload a new audio file to replace the existing one.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="imageFile">Cover Image (Optional)</Label>
                <Input id="imageFile" name="imageFile" type="file" accept="image/*" />
                <p className="text-xs text-muted-foreground">
                    Upload a new cover image to replace the existing one.
                </p>
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
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
}
