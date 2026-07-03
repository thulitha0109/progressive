"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useUserActions } from "@/contexts/user-actions-context"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function DeletePlaylistButton({ playlistId, className }: { playlistId: string, className?: string }) {
    const { handleDeletePlaylist } = useUserActions()
    const [confirm, setConfirm] = useState(false)

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (confirm) {
            handleDeletePlaylist(playlistId)
        } else {
            setConfirm(true)
            setTimeout(() => setConfirm(false), 3000)
        }
    }

    return (
        <Button
            variant={confirm ? "destructive" : "secondary"}
            size="icon"
            onClick={handleClick}
            className={cn(
                "h-8 w-8 rounded-full transition-all duration-200",
                confirm ? "w-auto px-3 gap-2" : "bg-white/10 hover:bg-red-500/20 hover:text-red-500 hover:scale-110",
                className
            )}
        >
            <Trash2 className="h-4 w-4" />
            {confirm && <span className="text-[10px] font-bold uppercase">Confirm?</span>}
        </Button>
    )
}
