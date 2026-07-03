"use client"

import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useSession } from "next-auth/react"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { useUserActions } from "@/contexts/user-actions-context"
import { usePlayer } from "@/components/shared/player-context"

export function LikeButton({
    trackId,
    itemId = trackId,
    type = "TRACK",
    initialLikes,
    initialIsLiked,
    onToggle,
    countClassName,
}: {
    trackId?: string
    itemId?: string
    type?: "TRACK" | "PODCAST"
    initialLikes: number
    initialIsLiked: boolean
    onToggle?: (isLiked: boolean, likesCount: number) => void
    countClassName?: string
}) {
    const router = useRouter()
    const { data: session } = useSession()
    const [error, setError] = useState("")
    const { likeStates, initializeLikeState, handleToggleLike } = useUserActions()
    const { setIsFullScreen } = usePlayer()

    const effectiveId = itemId || trackId

    // Initialize state strictly once per component unmount/mount cycle, or if the ID changes
    useEffect(() => {
        if (effectiveId) {
            initializeLikeState(effectiveId, initialIsLiked, initialLikes)
        }
    }, [effectiveId, initialIsLiked, initialLikes, initializeLikeState])

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!effectiveId) return

        setError("")

        // Ensure UI reacts immediately
        const currentState = likeStates[effectiveId] || { isLiked: initialIsLiked, likesCount: initialLikes }
        const newIsLiked = !currentState.isLiked
        const newLikes = currentState.likesCount + (newIsLiked ? 1 : -1)

        onToggle?.(newIsLiked, newLikes)

        const result = await handleToggleLike(effectiveId, type as "TRACK" | "PODCAST", !!session?.user)

        if (result === "Unauthorized") {
            setIsFullScreen(false)
            router.push("/auth/login")
        } else if (typeof result === "string") {
            setError(result)
            // Revert parent callback on error
            onToggle?.(!newIsLiked, currentState.likesCount)
        }
    }

    const state = effectiveId && likeStates[effectiveId] ? likeStates[effectiveId] : { isLiked: initialIsLiked, likesCount: initialLikes }

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 hover:text-red-500"
                onClick={handleLike}
            >
                <Heart
                    className={cn(
                        "h-4 w-4 transition-colors",
                        state.isLiked && "fill-red-500 text-red-500"
                    )}
                />
                <span className={cn("text-xs tabular-nums", countClassName)}>{state.likesCount}</span>
            </Button>
            {error && (
                <span className="absolute top-full left-0 text-xs text-destructive whitespace-nowrap">
                    {error}
                </span>
            )}
        </div>
    )
}
