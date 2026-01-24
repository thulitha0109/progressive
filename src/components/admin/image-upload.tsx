"use client"

import { useState } from "react"
import Image from "next/image"
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
    helperText?: string
}

export function ImageUpload({
    value,
    onChange,
    disabled,
    className,
    folder = "images",
    helperText,
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false)
    const [progress, setProgress] = useState(0)

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        setProgress(0)

        try {
            // 1. Compress Image
            console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`)

            // Import dynamically to avoid SSR issues if any (though likely fine in use client)
            const imageCompression = (await import("browser-image-compression")).default

            const options = {
                maxSizeMB: 1,           // Max 1MB
                maxWidthOrHeight: 1920, // Max 1920px
                useWebWorker: true,
                onProgress: (p: number) => setProgress(p / 2) // Spending 50% budget on compression
            }

            let uploadFile = file
            try {
                uploadFile = await imageCompression(file, options)
                console.log(`Compressed size: ${(uploadFile.size / 1024 / 1024).toFixed(2)} MB`)
            } catch (error) {
                console.warn("Compression failed, using original file:", error)
            }

            // 2. Get Presigned URL
            // Import server action dynamically or use from top level? Top level is cleaner but let's do top level import.
            // Wait, I can't add imports with replace_file_content easily if I only target this block.
            // I will add the import in a separate tool call or use the full file replacement for cleaner code.
            // For now, let's assume I'll add the import at the top.
            const { getPresignedUrl } = await import("@/server/actions/s3-sign")

            const { signedUrl, publicUrl } = await getPresignedUrl(uploadFile.name, uploadFile.type, folder)

            // 3. Upload to S3
            const xhr = new XMLHttpRequest()
            xhr.open("PUT", signedUrl)
            xhr.setRequestHeader("Content-Type", uploadFile.type)

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const percentComplete = (event.loaded / event.total) * 100
                    // Map upload progress to 50-100% range
                    setProgress(50 + (percentComplete / 2))
                }
            }

            xhr.onload = () => {
                if (xhr.status === 200) {
                    onChange(publicUrl)
                    setIsUploading(false)
                } else {
                    console.error("Upload failed", xhr.statusText)
                    setIsUploading(false)
                }
            }

            xhr.onerror = () => {
                console.error("Upload failed")
                setIsUploading(false)
            }

            xhr.send(uploadFile)

        } catch (error) {
            console.error("Upload error:", error)
            setIsUploading(false)
        }
    }

    if (value) {
        return (
            <div className={cn("relative rounded-lg overflow-hidden border aspect-video w-full max-w-[300px]", className)}>
                <div className="relative w-full h-full">
                    <Image
                        src={value}
                        alt="Uploaded image"
                        fill
                        className="object-cover"
                    />
                </div>
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
            {helperText && (
                <p className="text-xs text-muted-foreground">{helperText}</p>
            )}
            {!helperText && (
                <p className="text-xs text-muted-foreground">Max 2MB</p>
            )}
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
