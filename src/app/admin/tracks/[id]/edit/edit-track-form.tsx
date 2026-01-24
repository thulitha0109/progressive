"use client"

import { updateTrack } from "@/server/actions/tracks"
import { getPresignedUrl } from "@/server/actions/s3-sign"
import imageCompression from "browser-image-compression"
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
    type?: string | null
    scheduledFor: Date
    genreId?: string | null
    imageUrl?: string | null
    audioUrl?: string | null
    label?: string | null
    timeZone?: string
}

interface Genre {
    id: string
    name: string
    parentId?: string | null
}

export default function EditTrackForm({ track, artists, genres }: { track: Track, artists: Artist[], genres: Genre[] }) {
    const [selectedArtist, setSelectedArtist] = useState(track.artistId)
    const [error, setError] = useState("")
    const [isPending, startTransition] = useTransition()
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState(0)
    const router = useRouter()

    const [uploadStatus, setUploadStatus] = useState("")

    // Format date for datetime-local input
    const d = new Date(track.scheduledFor);
    const pad = (n: number) => n < 10 ? '0' + n : n;
    const scheduledForString = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    async function uploadFile(file: File): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const { signedUrl, publicUrl } = await getPresignedUrl(file.name, file.type, "tracks")
                const xhr = new XMLHttpRequest()
                xhr.open("PUT", signedUrl)
                xhr.setRequestHeader("Content-Type", file.type)

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100
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

    async function handleSubmit(formData: FormData) {
        setError("")
        setUploadStatus("")

        // Client-side validation
        const title = formData.get("title") as string
        const scheduledFor = formData.get("scheduledFor") as string
        const audioFile = formData.get("audioFile") as File
        const imageFile = formData.get("imageFile") as File

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

        if (audioFile && audioFile.size > 100 * 1024 * 1024) {
            setError(`Audio file is too large. Maximum size is 100MB (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`)
            return
        }

        setIsUploading(true)

        try {
            // Upload Audio
            if (audioFile && audioFile.size > 0) {
                setUploadStatus("Uploading audio...")
                const audioUrl = await uploadFile(audioFile)
                formData.set("audioUrl", audioUrl)
            }
            formData.delete("audioFile")

            // Upload Image
            if (imageFile && imageFile.size > 0) {
                setUploadStatus("Compressing & Uploading image...")

                const options = { maxSizeMB: 1, maxWidthOrHeight: 1500, useWebWorker: true }
                let fileToUpload = imageFile
                try {
                    fileToUpload = await imageCompression(imageFile, options)
                } catch (err) {
                    console.warn("Compression failed, using original:", err)
                }

                const imageUrl = await uploadFile(fileToUpload)
                formData.set("imageUrl", imageUrl)
            }
            formData.delete("imageFile")

            setUploadStatus("Saving changes...")
            startTransition(async () => {
                try {
                    await updateTrack(track.id, formData)
                    router.push("/admin/tracks")
                    router.refresh()
                } catch (err: any) {
                    if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                        return // Redirecting
                    }
                    setError(err.message || "Failed to update track. Please try again.")
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
                        {/* ... existing fields ... */}

                        {(isUploading || isPending) && uploadStatus && (
                            <div className="space-y-1 mb-4">
                                <div className="flex items-center justify-between gap-2 text-sm text-muted-foreground px-1">
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {uploadStatus}
                                    </div>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="artistId">Artist</Label>
                                <Select
                                    value={selectedArtist}
                                    onValueChange={setSelectedArtist}
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
                                    defaultValue={track.genreId || undefined}
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

                            <div className="space-y-2">
                                <Label htmlFor="type">Type</Label>
                                <Select name="type" defaultValue={track.type || "Warm"}>
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
                                    defaultValue={track.label || ""}
                                    placeholder="Record Label Name"
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        <input type="hidden" name="timeZone" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />

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
                                Upload a new audio file to replace the existing one (Max 100MB).
                            </p>
                            {track.audioUrl && (
                                <div className="mt-2 p-2 bg-secondary/20 rounded text-sm break-all">
                                    <span className="font-semibold">Current:</span> {track.audioUrl.split('/').pop()}
                                </div>
                            )}
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
                                Upload a new cover image to replace the existing one (Max 2MB).
                            </p>
                            {track.imageUrl && (
                                <div className="mt-2">
                                    <p className="text-sm font-semibold mb-1">Current:</p>
                                    <img
                                        src={track.imageUrl}
                                        alt="Current cover"
                                        className="w-32 h-32 object-cover rounded-md border"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isUploading || isPending}>
                                {(isUploading || isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {(isUploading || isPending) ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div >
    )
}
