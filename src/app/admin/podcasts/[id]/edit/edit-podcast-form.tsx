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
import { getPresignedUrl } from "@/server/actions/s3-sign"
import imageCompression from "browser-image-compression"
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
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("")
    const [selectedArtist, setSelectedArtist] = useState<string>(podcast.artistId || "")
    const router = useRouter()

    // Format date for datetime-local input
    const d = new Date(podcast.scheduledFor);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const scheduledForString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;


    async function uploadFile(file: File): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const { signedUrl, publicUrl } = await getPresignedUrl(file.name, file.type)
                const xhr = new XMLHttpRequest()
                xhr.open("PUT", signedUrl)
                xhr.setRequestHeader("Content-Type", file.type)

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100
                        // Update progress for checking
                        setUploadProgress(percentComplete)
                    }
                }

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        resolve(publicUrl)
                    } else {
                        reject(new Error("Failed to upload file to storage"))
                    }
                }

                xhr.onerror = () => reject(new Error("Network error during upload"))
                xhr.send(file)
            } catch (err) {
                console.error("Upload error:", err)
                reject(new Error("Failed to upload file"))
            }
        })
    }

    async function onSubmit(formData: FormData) {
        setIsLoading(true)
        try {
            // Handle checkbox boolean
            const isFeatured = (document.getElementById('isFeatured') as HTMLInputElement).checked
            formData.set("isFeatured", isFeatured ? "true" : "false")

            // Handle Direct Uploads
            const audioFile = formData.get("audioFile") as File
            const imageFile = formData.get("imageFile") as File

            if (audioFile && audioFile.size > 0) {
                // Upload Audio
                setUploadStatus("Uploading audio...")
                const audioUrl = await uploadFile(audioFile)
                formData.set("audioUrl", audioUrl)
                formData.delete("audioFile")
            }

            if (imageFile && imageFile.size > 0) {
                // Compress & Upload Image
                setUploadStatus("Uploading image...")
                const options = { maxSizeMB: 1, maxWidthOrHeight: 1500, useWebWorker: true }
                let fileToUpload = imageFile
                try {
                    fileToUpload = await imageCompression(imageFile, options)
                } catch (err) {
                    console.warn("Image compression failed, using original:", err)
                }
                const imageUrl = await uploadFile(fileToUpload)
                formData.set("imageUrl", imageUrl)
                formData.delete("imageFile")
            }

            setUploadStatus("Saving changes...")
            await updatePodcast(podcast.id, formData)
            // Redirect is handled in server action, but refreshes help client state
            // router.push("/admin/podcasts") 
            router.refresh()
        } catch (error) {
            // Checks for Next.js redirect error (which is thrown as an error)
            if (error instanceof Error && (error.message === "NEXT_REDIRECT" || error.message.includes("NEXT_REDIRECT"))) {
                return
            }
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
                    Max 100MB. Upload a new file to replace usages.
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
                <p className="text-xs text-muted-foreground">
                    Upload new cover (optional, Max 2MB).
                </p>
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
                    {isLoading ? (uploadStatus || "Saving...") : "Save Changes"}
                </Button>
            </div>
        </form >
    )
}
