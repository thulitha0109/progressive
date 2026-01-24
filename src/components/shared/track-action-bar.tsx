"use client"

import { LikeButton } from "@/components/shared/like-button"
import { ShareMenu } from "@/components/shared/share-menu"
import { Copy, ListPlus, Share2 } from "lucide-react"
import { toast } from "sonner"

interface TrackActionBarProps {
    trackId: string
    trackTitle: string
    artistName: string
    initialLikes: number
    initialIsLiked: boolean
}

export function TrackActionBar({
    trackId,
    trackTitle,
    artistName,
    initialLikes,
    initialIsLiked
}: TrackActionBarProps) {

    const handleCopyLink = async () => {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://progressive.lk"}/tracks/${trackId}`
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(url)
                toast.success("Link copied to clipboard")
            } else {
                throw new Error("Clipboard API unavailable")
            }
        } catch (err) {
            // Fallback
            const textarea = document.createElement("textarea")
            textarea.value = url
            document.body.appendChild(textarea)
            textarea.select()
            try {
                document.execCommand("copy")
                toast.success("Link copied to clipboard")
            } catch (e) {
                toast.error("Failed to copy link")
            } finally {
                document.body.removeChild(textarea)
            }
        }
    }

    const handleAddToPlaylist = () => {
        toast("Added to playlist")
    }

    return (
        <div className="flex items-center gap-3">
            {/* Like Button */}
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer group">
                <LikeButton
                    trackId={trackId}
                    initialLikes={initialLikes}
                    initialIsLiked={initialIsLiked}
                    type="TRACK"
                />
            </div>

            {/* Share Button */}
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer">
                <ShareMenu
                    url={`/tracks/${trackId}`}
                    title={trackTitle}
                    text={`Check out ${trackTitle} by ${artistName}`}
                >
                    <Share2 className="w-5 h-5" />
                </ShareMenu>
            </div>

            {/* Copy Link Button */}
            <div
                onClick={handleCopyLink}
                className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                title="Copy Link"
            >
                <Copy className="w-5 h-5" />
            </div>

            {/* Add to Playlist Button */}
            <div
                onClick={handleAddToPlaylist}
                className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center"
                title="Add to Playlist"
            >
                <ListPlus className="w-5 h-5" />
            </div>
        </div>
    )
}
