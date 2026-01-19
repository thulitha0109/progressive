"use client"

import * as React from "react"
import { Share2, Link2, Twitter, Facebook, MessageCircle } from "lucide-react"
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
    const handleCopyLink = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
    }

    const handleShareTwitter = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    }

    const handleShareFacebook = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    }

    const handleShareWhatsApp = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank')
    }

    // Attempt to use native share if available and user is on mobile (optional, but consistent UI is often better)
    // For now, we'll force the dropdown for consistency across platforms unless requested otherwise.

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
                    <Link2 className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Share on Twitter">
                    <Twitter className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Share on Facebook">
                    <Facebook className="h-4 w-4" />
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer p-2 rounded-full focus:bg-accent" title="Share on WhatsApp">
                    <MessageCircle className="h-4 w-4" />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
