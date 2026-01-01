"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBlogPost } from "@/server/actions/admin/blog"
import { getPresignedUrl } from "@/server/actions/s3-sign"
import imageCompression from "browser-image-compression"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Loader2, Upload } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface Category {
    id: string
    name: string
}

export default function NewBlogPostForm({ categories }: { categories: Category[] }) {
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState("")
    const [uploadStatus, setUploadStatus] = useState("")
    const router = useRouter()

    async function uploadImage(file: File): Promise<string> {
        try {
            const { signedUrl, publicUrl } = await getPresignedUrl(file.name, file.type)
            const uploadResponse = await fetch(signedUrl, {
                method: "PUT",
                body: file,
                headers: { "Content-Type": file.type },
            })
            if (!uploadResponse.ok) throw new Error("Failed to upload image")
            return publicUrl
        } catch (err) {
            console.error("Upload error:", err)
            throw new Error("Failed to upload image")
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setError("")
        setUploadStatus("")

        const formData = new FormData(e.currentTarget)
        const coverImageFile = formData.get("coverImageFile") as File

        startTransition(async () => {
            try {
                // Upload cover image if provided
                if (coverImageFile && coverImageFile.size > 0) {
                    setUploadStatus("Compressing & Uploading cover image...")

                    const options = { maxSizeMB: 1, maxWidthOrHeight: 1920, useWebWorker: true }
                    let fileToUpload = coverImageFile
                    try {
                        fileToUpload = await imageCompression(coverImageFile, options)
                    } catch (err) {
                        console.warn("Compression failed, using original:", err)
                    }

                    const imageUrl = await uploadImage(fileToUpload)
                    formData.set("coverImage", imageUrl)
                }
                formData.delete("coverImageFile")
                formData.delete("coverImageFile")

                setUploadStatus("Creating post...")
                await createBlogPost(formData)
            } catch (err: any) {
                if (err.message === "NEXT_REDIRECT" || err.message.includes("NEXT_REDIRECT")) {
                    return // Redirecting
                }
                console.error("Error:", err)
                setError(err.message || "Failed to create post. Please try again.")
                setUploadStatus("")
            }
        })
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/blog" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">New Blog Post</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Post Details</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-destructive font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        name="title"
                                        placeholder="Post Title"
                                        required
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="content">Content</Label>
                                    <Textarea
                                        id="content"
                                        name="content"
                                        placeholder="Write your post content here..."
                                        className="min-h-[400px] font-mono"
                                        required
                                        disabled={isPending}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="excerpt">Excerpt</Label>
                                    <Textarea
                                        id="excerpt"
                                        name="excerpt"
                                        placeholder="Short summary for listings..."
                                        className="min-h-[100px]"
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4 rounded-lg border p-4">
                                    <h3 className="font-medium">Publishing</h3>
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="isPublished">Publish immediately</Label>
                                        <Switch id="isPublished" name="isPublished" disabled={isPending} />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="categoryId">Category</Label>
                                    <Select name="categoryId" disabled={isPending}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select category" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="coverImageFile">Cover Image</Label>
                                    <Input
                                        id="coverImageFile"
                                        name="coverImageFile"
                                        type="file"
                                        accept="image/*"
                                        disabled={isPending}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        Upload cover image (optional, Max 2MB)
                                    </p>
                                </div>

                                {isPending && uploadStatus && (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {uploadStatus}
                                    </div>
                                )}

                                <Button type="submit" className="w-full" disabled={isPending}>
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isPending ? "Creating..." : "Create Post"}
                                </Button>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
