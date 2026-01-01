"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { updateArtist } from "@/server/actions/artists"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, X } from "lucide-react"

interface Artist {
    id: string
    name: string
    bio: string
    imageUrl?: string | null
    socialLinks?: any
    socialProfiles?: string | null
}

export default function EditArtistForm({ artist }: { artist: Artist }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [uploadStatus, setUploadStatus] = useState("")
    const [imagePreview, setImagePreview] = useState<string | null>(artist.imageUrl || null)

    let socialProfiles: any = { instagram: "", twitter: "", soundcloud: "", facebook: "", tiktok: "", spotify: "" }
    try {
        if (artist.socialLinks) {
            socialProfiles = artist.socialLinks
        } else if (artist.socialProfiles) {
            socialProfiles = JSON.parse(artist.socialProfiles)
        }
    } catch (e) {
        console.error("Failed to parse social profiles", e)
    }

    async function uploadImage(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const formData = new FormData()
            formData.append("file", file)
            formData.append("type", "images")

            const xhr = new XMLHttpRequest()
            xhr.open("POST", "/api/upload")

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText)
                    resolve(response.url)
                } else {
                    reject(new Error("Image upload failed"))
                }
            }

            xhr.onerror = () => {
                reject(new Error("Image upload failed"))
            }

            xhr.send(formData)
        })
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setUploadStatus("")

        const formData = new FormData(e.currentTarget)
        const imageFile = formData.get("imageFile") as File

        startTransition(async () => {
            try {
                // Upload image if provided
                if (imageFile && imageFile.size > 0) {
                    setUploadStatus("Uploading image...")
                    const imageUrl = await uploadImage(imageFile)
                    formData.set("imageUrl", imageUrl)
                } else if (imagePreview) {
                    // Keep existing image
                    formData.set("imageUrl", imagePreview)
                }
                formData.delete("imageFile")

                setUploadStatus("Updating artist...")
                await updateArtist(artist.id, formData)
            } catch (err: any) {
                if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                    return // Redirecting
                }
                console.error("Error:", err)
                setError(err.message || "Failed to update artist. Please try again.")
                setUploadStatus("")
            }
        })
    }

    function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    function clearImage() {
        setImagePreview(null)
        const fileInput = document.getElementById("imageFile") as HTMLInputElement
        if (fileInput) fileInput.value = ""
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/artists" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Artists
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Artist</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Artist Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Artist Name"
                                required
                                defaultValue={artist.name}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Artist biography..."
                                className="min-h-[150px]"
                                required
                                defaultValue={artist.bio}
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageFile">Artist Image</Label>
                            {imagePreview && (
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2"
                                        onClick={clearImage}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                            <Input
                                id="imageFile"
                                name="imageFile"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                disabled={isPending}
                            />
                            <p className="text-xs text-muted-foreground">
                                Upload new image (optional, Max 2MB, Recommended 500x500px)
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    name="instagram"
                                    placeholder="https://instagram.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.instagram || ""}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    name="twitter"
                                    placeholder="https://twitter.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.twitter || ""}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="soundcloud">SoundCloud</Label>
                                <Input
                                    id="soundcloud"
                                    name="soundcloud"
                                    placeholder="https://soundcloud.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.soundcloud || ""}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="facebook">Facebook</Label>
                                <Input
                                    id="facebook"
                                    name="facebook"
                                    placeholder="https://facebook.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.facebook || ""}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="tiktok">TikTok</Label>
                                <Input
                                    id="tiktok"
                                    name="tiktok"
                                    placeholder="https://tiktok.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.tiktok || ""}
                                    disabled={isPending}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="spotify">Spotify</Label>
                                <Input
                                    id="spotify"
                                    name="spotify"
                                    placeholder="https://open.spotify.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.spotify || ""}
                                    disabled={isPending}
                                />
                            </div>
                        </div>

                        {isPending && uploadStatus && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {uploadStatus}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isPending ? "Updating..." : "Update Artist"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
