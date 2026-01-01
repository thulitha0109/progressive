
"use client"

import { createPodcast } from "@/server/actions/podcasts"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

interface Artist {
    id: string
    name: string
}

interface Genre {
    id: string
    name: string
    parentId?: string | null
}

export default function PodcastForm({ artists, genres }: { artists: Artist[], genres: Genre[] }) {
    const [selectedArtist, setSelectedArtist] = useState("")
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("")

    async function uploadFile(file: File, type: "audio" | "image", artistId: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", type)
            formData.append("entityType", "podcast")
            // Pass artistId instead of hostName for podcast now, logic will be handled in route.ts
            formData.append("artistId", artistId)

            const xhr = new XMLHttpRequest()
            xhr.open("POST", "/api/upload")

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    if (type === "audio") {
                        setUploadProgress(percentComplete)
                    }
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText)
                    resolve(response.url)
                } else {
                    reject(new Error("Upload failed"))
                }
            }

            xhr.onerror = () => {
                reject(new Error("Upload failed"))
            }

            xhr.send(formData)
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setUploadProgress(0)
        setUploadStatus("")

        const formData = new FormData(e.currentTarget)

        // Client-side validation
        const title = formData.get("title") as string
        const audioFile = formData.get("audioFile") as File
        const imageFile = formData.get("imageFile") as File

        if (!title?.trim()) {
            setError("Please enter a podcast title")
            return
        }

        if (!selectedArtist) {
            setError("Please select an artist")
            return
        }

        if (!audioFile || audioFile.size === 0) {
            setError("Please select an audio file")
            return
        }

        // Validate file size (100MB for podcast audio)
        const MAX_AUDIO_SIZE = 100 * 1024 * 1024
        if (audioFile.size > MAX_AUDIO_SIZE) {
            setError(`Audio file is too large. Maximum size is 100MB (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`)
            return
        }

        startTransition(async () => {
            try {
                // 1. Upload Audio
                setUploadStatus("Uploading audio...")
                const audioUrl = await uploadFile(audioFile, "audio", selectedArtist)
                formData.set("audioUrl", audioUrl)
                formData.delete("audioFile") // Remove file from server action payload

                // 2. Upload Image (if exists)
                if (imageFile && imageFile.size > 0) {
                    setUploadStatus("Uploading image...")
                    const imageUrl = await uploadFile(imageFile, "image", selectedArtist)
                    formData.set("imageUrl", imageUrl)
                    formData.delete("imageFile")
                }

                // 3. Create Podcast
                setUploadStatus("Saving podcast...")
                await createPodcast(formData)
            } catch (err: any) {
                if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                    return // Redirecting, so no error
                }
                console.error("Upload error:", err)
                setError(err.message || "Failed to upload podcast. Please try again.")
                setUploadStatus("")
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/podcasts" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Podcasts
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Podcast</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Podcast Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Podcast Title"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch id="isFeatured" name="isFeatured" disabled={isPending} />
                            <Label htmlFor="isFeatured">Featured Podcast</Label>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="artistId">Artist</Label>
                            <Select
                                value={selectedArtist}
                                onValueChange={setSelectedArtist}
                                disabled={isPending}
                            >
                                <SelectTrigger id="artistId">
                                    <SelectValue placeholder="Select an artist" />
                                </SelectTrigger>
                                <SelectContent className="max-h-[300px]">
                                    {artists.map((artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                            {artist.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Hidden input to include artistId in FormData */}
                            <input type="hidden" name="artistId" value={selectedArtist} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="genreId">Genre</Label>
                            <Select
                                name="genreId"
                                disabled={isPending}
                            >
                                <SelectTrigger id="genreId">
                                    <SelectValue placeholder="Select a genre (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {genres.filter(g => !g.parentId).map((parent) => (
                                        <div key={parent.id}>
                                            <SelectItem value={parent.id} className="font-semibold">
                                                {parent.name}
                                            </SelectItem>
                                            {genres
                                                .filter(g => g.parentId === parent.id)
                                                .map(sub => (
                                                    <SelectItem key={sub.id} value={sub.id} className="pl-6 text-muted-foreground">
                                                        {sub.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </div>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required
                                placeholder="Podcast description..."
                                className="min-h-[100px]"
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sequence">Sequence No</Label>
                            <Input
                                id="sequence"
                                name="sequence"
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                placeholder="001"
                                required
                                disabled={isPending}
                                className="font-mono"
                            />
                            <p className="text-xs text-muted-foreground">
                                Order in which the podcast appears (e.g. 001, 002).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="audioFile">Audio File</Label>
                            <Input
                                id="audioFile"
                                name="audioFile"
                                type="file"
                                accept="audio/*"
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload the MP3 file (Max 100MB).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageFile">Cover Image (Optional)</Label>
                            <Input
                                id="imageFile"
                                name="imageFile"
                                type="file"
                                accept="image/*"
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload cover art (optional, Max 2MB).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledFor">Schedule Publication</Label>
                            <Input
                                id="scheduledFor"
                                name="scheduledFor"
                                type="datetime-local"
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Leave blank to publish immediately.
                            </p>
                        </div>

                        {isPending && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>{uploadStatus}</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Processing..." : "Create Podcast"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
