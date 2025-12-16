"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Upload, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageUploadProps {
    value?: string | null
    onChange: (url: string) => void
    disabled?: boolean
    className?: string
    folder?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    className,
    folder = "images"
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setProgress(0)

        // Create FormData
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", folder)

        try {
            const xhr = new XMLHttpRequest()
            xhr.open("POST", "/api/upload")

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    setProgress(percentComplete)
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText)
                    onChange(response.url)
                } else {
                    console.error("Upload failed")
                }
                setIsUploading(false)
            }

            xhr.onerror = () => {
                console.error("Upload failed")
                setIsUploading(false)
            }

            xhr.send(formData)
        } catch (error) {
            console.error("Upload error:", error)
            setIsUploading(false)
        }
    }

    if (value) {
        return (
            <div className={cn("relative rounded-lg overflow-hidden border aspect-video w-full max-w-[300px]", className)}>
                <img
                    src={value}
                    alt="Uploaded image"
                    className="w-full h-full object-cover"
                />
                <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => onChange("")}
                    disabled={disabled}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            <div className="flex items-center gap-4">
                <Input
                    type="file"
                    accept="image/*"
                    disabled={disabled || isUploading}
                    onChange={handleUpload}
                    className="flex-1"
                />
            </div>
            {isUploading && (
                <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Uploading...</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
