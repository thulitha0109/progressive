"use client"

import { updateTrack } from "@/app/actions/tracks"
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

interface Track {
    id: string
    title: string
    artistId: string
    scheduledFor: Date
    genre?: string | null
}

export default function EditTrackForm({ track, artists }: { track: Track, artists: Artist[] }) {
    const [selectedArtist, setSelectedArtist] = useState(track.artistId)
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    // Format date for datetime-local input
    const d = new Date(track.scheduledFor);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const scheduledForString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    async function handleSubmit(formData: FormData) {
        setError("")

        // Client-side validation
        const title = formData.get("title") as string
        const scheduledFor = formData.get("scheduledFor") as string

        if (!title?.trim()) {
            setError("Please enter a track title")
            return
        }

        if (!selectedArtist) {
            setError("Please select an artist")
            return
        }

        if (!scheduledFor) {
            setError("Please select a scheduled date and time")
            return
        }

        // Add artistId to form data
        formData.set("artistId", selectedArtist)

        startTransition(async () => {
            try {
                await updateTrack(track.id, formData)
                router.push("/admin/tracks")
                router.refresh()
            } catch (err: any) {
                setError(err.message || "Failed to update track. Please try again.")
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
                <h1 className="text-3xl font-bold tracking-tight">Edit Track</h1>
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

                    <form action={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                name="title"
                                defaultValue={track.title}
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
                                <SelectContent>
                                    {artists.map((artist) => (
                                        <SelectItem key={artist.id} value={artist.id}>
                                            {artist.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <input type="hidden" name="artistId" value={selectedArtist} />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="genre">Genre</Label>
                            <Select
                                name="genre"
                                defaultValue={track.genre || undefined}
                                disabled={isPending}
                            >
                                <SelectTrigger id="genre">
                                    <SelectValue placeholder="Select a genre (optional)" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Progressive House">Progressive House</SelectItem>
                                    <SelectItem value="Techno">Techno</SelectItem>
                                    <SelectItem value="Trance">Trance</SelectItem>
                                    <SelectItem value="Progressive Trance">Progressive Trance</SelectItem>
                                    <SelectItem value="Melodic Techno">Melodic Techno</SelectItem>
                                    <SelectItem value="Deep House">Deep House</SelectItem>
                                    <SelectItem value="Tech House">Tech House</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="scheduledFor">Schedule Publication</Label>
                            <Input
                                id="scheduledFor"
                                name="scheduledFor"
                                type="datetime-local"
                                defaultValue={scheduledForString}
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="audioFile">Audio File (Optional)</Label>
                            <Input
                                id="audioFile"
                                name="audioFile"
                                type="file"
                                accept="audio/*"
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload a new audio file to replace the existing one (Max 50MB).
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
                                Upload a new cover image to replace the existing one (Max 10MB).
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
