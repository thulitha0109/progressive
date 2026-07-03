"use client"

import { Button } from "@/components/ui/button"
import { ListPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUserActions } from "@/contexts/user-actions-context"

interface AddToPlaylistButtonProps {
    itemId: string
    type: "TRACK" | "PODCAST"
    className?: string
}

export function AddToPlaylistButton({ itemId, type, className }: AddToPlaylistButtonProps) {
    const { openPlaylistDialog } = useUserActions()

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        e.preventDefault()
        openPlaylistDialog(itemId, type)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("text-gray-400 hover:text-white hover:scale-105 transition-all", className)}
            onClick={handleClick}
            title="Add to Playlist"
        >
            <ListPlus className="h-5 w-5" />
        </Button>
    )
}
