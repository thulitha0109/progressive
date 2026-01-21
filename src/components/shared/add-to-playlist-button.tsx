"use client"

import { Button } from "@/components/ui/button"
import { ListPlus } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface AddToPlaylistButtonProps {
    trackId: string
    className?: string
}

export function AddToPlaylistButton({ trackId, className }: AddToPlaylistButtonProps) {
    const handleAddToPlaylist = (e: React.MouseEvent) => {
        e.stopPropagation()
        // TODO: Implement actual playlist logic
        toast.success("Added to playlist")
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("text-gray-400 hover:text-white hover:scale-105 transition-all", className)}
            onClick={handleAddToPlaylist}
            title="Add to Playlist"
        >
            <ListPlus className="h-5 w-5" />
        </Button>
    )
}
