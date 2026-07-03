"use client"

import { useUserActions } from "@/contexts/user-actions-context"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

export function RemoveFromPlaylistButton({
    playlistId,
    itemId,
    type
}: {
    playlistId: string;
    itemId: string;
    type: "TRACK" | "PODCAST"
}) {
    const { handleRemoveItemFromPlaylist } = useUserActions()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-white hover:bg-destructive rounded-full bg-black/50 backdrop-blur-md"
            onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleRemoveItemFromPlaylist(playlistId, itemId, type)
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}
