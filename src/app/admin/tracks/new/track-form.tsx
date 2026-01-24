"use client"

import { createTrack } from "@/server/actions/tracks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import imageCompression from "browser-image-compression"
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
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStatus, setUploadStatus] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    async function uploadFile(file: File, type: "audio" | "image", artistId: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                // Get Presigned URL
                const { getPresignedUrl } = await import("@/server/actions/s3-sign")
                // Use a folder structure like: artists/slug/filename
                // But we don't have the slug here easily without a db call or passing it in.
                // The current `s3-sign` puts it in `uploads/timestamp-file`.
                // Ideally we want `artists/slug/...`.
                // We can pass `artists` as the folder, but the `s3-sign` action might need to be smarter if we want exact structure.
                // For now, let's trust `s3-sign` to handle "artists" folder, and the filename uniqueness.
                // The original logic relied on `saveUploadedFile` to fetch slug.
                // If we want strict paths, we should update `getPresignedUrl` to take a path or fetch the artist slug.
                // Or we can just use "artists" folder and not worry about sub-slug folders for now (flat structure in artists/).
                // OR we pass the artist ID and let server action resolve it?
                // Let's stick to "artists" folder for simplicity in this optimization phase.

                const folder = type === "audio" ? "artists" : "images" // Or specific folder logic

                const { signedUrl, publicUrl } = await getPresignedUrl(file.name, file.type, folder)

                const xhr = new XMLHttpRequest()
                xhr.open("PUT", signedUrl)
                xhr.setRequestHeader("Content-Type", file.type)

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
                        resolve(publicUrl)
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`))
                    }
                }

                xhr.onerror = () => {
                    reject(new Error("Upload failed"))
                }

                xhr.send(file)
            } catch (err) {
                reject(err)
            }
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

        // Validate file size (100MB for audio)
        const MAX_AUDIO_SIZE = 100 * 1024 * 1024
        if (audioFile.size > MAX_AUDIO_SIZE) {
            setError(`Audio file is too large. Maximum size is 100MB (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`)
            return
        }

        setIsUploading(true)

        try {
            // 1. Upload Audio
            setUploadStatus("Uploading audio...")
            const audioUrl = await uploadFile(audioFile, "audio", selectedArtist)
            formData.set("audioUrl", audioUrl)
            formData.delete("audioFile") // Remove file from server action payload

            // 2. Upload Image (if exists)
            if (imageFile && imageFile.size > 0) {
                setUploadStatus("Compressing & Uploading image...")

                // Compress Image
                const options = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1500,
                    useWebWorker: true,
                }

                let fileToUpload = imageFile
                try {
                    const compressedFile = await imageCompression(imageFile, options)
                    fileToUpload = compressedFile
                } catch (err) {
                    console.warn("Image compression failed, using original:", err)
                }

                const imageUrl = await uploadFile(fileToUpload, "image", selectedArtist)
                formData.set("imageUrl", imageUrl)
                formData.delete("imageFile")
            }

            // 3. Create Track
            setUploadStatus("Saving track...")

            startTransition(async () => {
                try {
                    await createTrack(formData)
                } catch (err: any) {
                    if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                        return // Redirecting
                    }
                    console.error("Creation error:", err)
                    setError(err.message || "Failed to create track.")
                    setUploadStatus("")
                    setIsUploading(false)
                }
            })
        } catch (err: any) {
            console.error("Upload error:", err)
            setError(err.message || "Failed to upload files.")
            setUploadStatus("")
            setIsUploading(false)
        }
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
                                <SelectContent>
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
                            <Label htmlFor="type">Type</Label>
                            <Select name="type" defaultValue="none" disabled={isPending}>
                                <SelectTrigger id="type">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Original">Original</SelectItem>
                                    <SelectItem value="Remix">Remix</SelectItem>
                                    <SelectItem value="Bootleg">Bootleg</SelectItem>
                                    <SelectItem value="Mashup">Mashup</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="label">Label (Optional)</Label>
                            <Input
                                id="label"
                                name="label"
                                placeholder="Record Label Name"
                                disabled={isPending}
                            />
                        </div>

                        <input type="hidden" name="timeZone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />

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
                            <Label htmlFor="imageFile">Cover Image</Label>
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
                                required
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                The track will be visible to users after this time.
                            </p>
                        </div>

                        {(isUploading || isPending) && (
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
                            <Button type="submit" disabled={isUploading || isPending}>
                                {(isUploading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {(isUploading || isPending) ? (uploadStatus || "Processing...") : "Upload Track"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
