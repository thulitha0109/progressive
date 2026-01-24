"use client"

import * as React from "react"
import { Share2, Copy, Instagram, MessageCircle } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface ShareMenuProps {
    url: string
    title: string
    text: string
    children?: React.ReactNode
}

export function ShareMenu({ url, title, text, children }: ShareMenuProps) {
    const handleCopyLink = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                toast.success("Link copied to clipboard")
            } else {
                // Fallback for non-secure contexts or incompatible browsers
                const textArea = document.createElement("textarea")
                textArea.value = url
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                document.body.removeChild(textArea)
                toast.success("Link copied to clipboard")
            }
        } catch (err) {
            console.error("Failed to copy link:", err)
            toast.error("Failed to copy link")
        }
    }

    const handleShareInstagram = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                toast.success("Link copied! Open Instagram to share.")
            } else {
                // Fallback
                const textArea = document.createElement("textarea")
                textArea.value = url
                document.body.appendChild(textArea)
                textArea.select()
                document.execCommand("copy")
                document.body.removeChild(textArea)
                toast.success("Link copied! Open Instagram to share.")
            }
        } catch (err) {
            console.error("Failed to copy link:", err)
            toast.error("Failed to copy link")
        }
    }

    const handleShareWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children || (
                    <button className="p-2 hover:bg-accent rounded-full transition-colors">
                        <Share2 className="h-4 w-4" />
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                side="left"
                className="w-auto min-w-0 flex flex-row items-center gap-1 p-1 animate-in zoom-in-90 slide-in-from-right-5 duration-300"
            >
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Copy Link">
                    <Copy className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareInstagram} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Share on Instagram">
                    <Instagram className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Share on WhatsApp">
                    <MessageCircle className="h-4 w-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
