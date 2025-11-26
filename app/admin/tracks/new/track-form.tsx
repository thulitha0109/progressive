"use client"

import { createTrack } from "@/app/actions/tracks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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

interface Artist {
    id: string
    name: string
}

interface Genre {
    id: string
    name: string
    parentId?: string | null
}

export default function TrackForm({ artists, genres }: { artists: Artist[], genres: Genre[] }) {
    const [selectedArtist, setSelectedArtist] = useState("")
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")

        const formData = new FormData(e.currentTarget)

        // Client-side validation
        const title = formData.get("title") as string
        const audioFile = formData.get("audioFile") as File
        const scheduledFor = formData.get("scheduledFor") as string

        if (!title?.trim()) {
            setError("Please enter a track title")
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

        if (!scheduledFor) {
            setError("Please select a scheduled date and time")
            return
        }

        // Validate file size (50MB for audio)
        const MAX_AUDIO_SIZE = 50 * 1024 * 1024
        if (audioFile.size > MAX_AUDIO_SIZE) {
            setError(`Audio file is too large. Maximum size is 50MB (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`)
            return
        }

        startTransition(async () => {
            try {
                // Use the original formData - it now has all fields including artistId from hidden input
                await createTrack(formData)
            } catch (err: any) {
                if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                    return // Redirecting, so no error
                }
                console.error("Upload error:", err)
                setError(err.message || "Failed to upload track. Please try again.")
            }
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/tracks" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tracks
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Upload New Track</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Track Details</CardTitle>
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
                                placeholder="Track Title"
                                required
                                disabled={isPending}
                            />
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
                                Upload the MP3 file (Max 50MB).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageFile">Cover Image</Label>
                            <Input
                                id="imageFile"
                                name="imageFile"
                                type="file"
                                accept="image/*"
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload cover art (optional, Max 10MB).
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledFor">Schedule Publication</Label>
                            <Input
                                id="scheduledFor"
                                name="scheduledFor"
                                type="datetime-local"
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                The track will be visible to users after this time.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Uploading..." : "Upload Track"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
