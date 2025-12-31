"use client"

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
import { updatePodcast } from "@/server/actions/podcasts"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface Artist {
    id: string
    name: string
}

interface Genre {
    id: string
    name: string
}

import { Switch } from "@/components/ui/switch"

interface EditPodcastFormProps {
    podcast: {
        id: string
        title: string
        description: string
        artistId: string | null
        genreId?: string | null
        sequence: number
        isFeatured: boolean
        scheduledFor: Date
        audioUrl?: string | null
        imageUrl?: string | null
    }
    artists: Artist[]
    genres: Genre[]
}

export default function EditPodcastForm({ podcast, artists, genres }: EditPodcastFormProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [selectedArtist, setSelectedArtist] = useState<string>(podcast.artistId || "")
    const router = useRouter()

    // Format date for datetime-local input
    const d = new Date(podcast.scheduledFor);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const scheduledForString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;


    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            // Handle checkbox boolean
            const isFeatured = (document.getElementById('isFeatured') as HTMLInputElement).checked
            formData.set("isFeatured", isFeatured ? "true" : "false")

            await updatePodcast(podcast.id, formData)
            // Redirect is handled in server action, but refreshes help client state
            // router.push("/admin/podcasts") 
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
                    disabled={isLoading}
                />
            </div>

            <div className="flex items-center space-x-2">
                <Switch
                    id="isFeatured"
                    name="isFeatured"
                    defaultChecked={podcast.isFeatured}
                    disabled={isLoading}
                />
                <Label htmlFor="isFeatured">Featured Podcast</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="artistId">Artist</Label>
                    <Select
                        value={selectedArtist}
                        onValueChange={setSelectedArtist}
                        disabled={isLoading}
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
                    <Label htmlFor="genreId">Genre</Label>
                    <Select
                        name="genreId"
                        defaultValue={podcast.genreId || undefined}
                        disabled={isLoading}
                    >
                        <SelectTrigger id="genreId">
                            <SelectValue placeholder="Select a genre" />
                        </SelectTrigger>
                        <SelectContent>
                            {genres.map((genre) => (
                                <SelectItem key={genre.id} value={genre.id}>
                                    {genre.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="sequence">Sequence No</Label>
                    <Input
                        id="sequence"
                        name="sequence"
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        defaultValue={podcast.sequence.toString().padStart(3, '0')}
                        disabled={isLoading}
                        required
                        className="font-mono"
                    />
                    <p className="text-xs text-muted-foreground">e.g. 001, 002</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scheduledFor">Schedule Publication</Label>
                    <Input
                        id="scheduledFor"
                        name="scheduledFor"
                        type="datetime-local"
                        defaultValue={scheduledForString}
                        required
                        disabled={isLoading}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    name="description"
                    required
                    defaultValue={podcast.description}
                    className="min-h-[100px]"
                    disabled={isLoading}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="audioFile">Audio File (Optional)</Label>
                <Input
                    id="audioFile"
                    name="audioFile"
                    type="file"
                    accept="audio/*"
                    disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                    Max 150MB. Upload a new file to replace usages.
                </p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="imageFile">Cover Image (Optional)</Label>
                <Input
                    id="imageFile"
                    name="imageFile"
                    type="file"
                    accept="image/*"
                    disabled={isLoading}
                />
                {podcast.imageUrl && (
                    <div className="mt-2 text-sm text-muted-foreground">
                        Current: <a href={podcast.imageUrl} target="_blank" className="underline">View Image</a>
                    </div>
                )}
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
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isLoading ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form >
    )
}
