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
    const handleCopyLink = () => {
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
    }

    const handleShareTwitter = () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
    }

    const handleShareFacebook = () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    }

    const handleShareWhatsApp = () => {
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
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                    <Link2 className="mr-2 h-4 w-4" />
                    <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
                    <Twitter className="mr-2 h-4 w-4" />
                    <span>Twitter</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareFacebook} className="cursor-pointer">
                    <Facebook className="mr-2 h-4 w-4" />
                    <span>Facebook</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShareWhatsApp} className="cursor-pointer">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>WhatsApp</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
