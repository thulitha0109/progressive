"use client"

import { LikeButton } from "@/components/shared/like-button"
import { ShareMenu } from "@/components/shared/share-menu"
import { Copy, ListPlus, Share2 } from "lucide-react"
import { toast } from "sonner"

interface PodcastActionBarProps {
    podcastId: string
    podcastSlug: string
    podcastTitle: string
    artistName: string
    initialLikes: number
    initialIsLiked: boolean
}

export function PodcastActionBar({
    podcastId,
    podcastSlug,
    podcastTitle,
    artistName,
    initialLikes,
    initialIsLiked
}: PodcastActionBarProps) {

    const handleCopyLink = () => {
        const url = `${process.env.NEXT_PUBLIC_APP_URL || "https://progressive.lk"}/podcasts/${podcastSlug}`
        navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
    }

    const handleAddToPlaylist = () => {
        toast("Added to playlist")
    }

    return (
        <div className="flex items-center gap-3">
            {/* Like Button */}
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer group">
                <LikeButton
                    trackId={podcastId}
                    initialLikes={initialLikes}
                    initialIsLiked={initialIsLiked}
                    type="PODCAST"
                />
            </div>

            {/* Share Button */}
            <div className="bg-black/40 backdrop-blur-md p-3 rounded-md border border-white/10 text-white hover:bg-white/10 transition-colors cursor-pointer">
                <ShareMenu
                    url={`/podcasts/${podcastSlug}`}
                    title={podcastTitle}
                    text={`Check out ${podcastTitle} by ${artistName}`}
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
