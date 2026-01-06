"use client"

import { toggleLike, togglePodcastLike } from "@/server/actions/likes"
import { Button } from "@/components/ui/button"
import { Heart } from "lucide-react"
import { useOptimistic, startTransition, useState } from "react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

export function LikeButton({
    trackId, // Rename to itemId conceptually, but keep trackId for compat or alias it
    itemId = trackId,
    type = "TRACK",
    initialLikes,
    initialIsLiked,
}: {
    trackId?: string
    itemId?: string
    type?: "TRACK" | "PODCAST"
    initialLikes: number
    initialIsLiked: boolean
}) {
    const router = useRouter()
    const [error, setError] = useState("")
    const [optimisticState, addOptimistic] = useOptimistic(
        { likes: initialLikes, isLiked: initialIsLiked },
        (state, newIsLiked: boolean) => ({
            likes: state.likes + (newIsLiked ? 1 : -1),
            isLiked: newIsLiked,
        })
    )

    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (!itemId) return

        setError("")
        const newState = !optimisticState.isLiked

        startTransition(() => {
            addOptimistic(newState)
        })

        try {
            const result = type === "PODCAST"
                ? await togglePodcastLike(itemId)
                : await toggleLike(itemId)

            if (result?.error) {
                // Revert optimistic update on error
                startTransition(() => {
                    addOptimistic(!newState)
                })

                // If unauthorized, redirect to login
                if (result.error === "Unauthorized") {
                    router.push("/auth/login")
                } else {
                    setError(result.error)
                }
            }
        } catch (err: any) {
            // Revert optimistic update on error
            startTransition(() => {
                addOptimistic(!newState)
            })

            // Check if it's an authentication error
            if (err.message?.includes("logged in")) {
                router.push("/auth/login")
            } else {
                setError("Failed to update like")
            }
        }
    }

    return (
        <div className="relative">
            <Button
                size="sm"
                variant="ghost"
                className="flex items-center gap-1 hover:text-red-500 px-2"
                onClick={handleLike}
            >
                <Heart
                    className={cn(
                        "h-4 w-4 transition-colors",
                        optimisticState.isLiked && "fill-red-500 text-red-500"
                    )}
                />
                <span className="text-xs tabular-nums">{optimisticState.likes}</span>
            </Button>
            {error && (
                <span className="absolute top-full left-0 text-xs text-destructive whitespace-nowrap">
                    {error}
                </span>
            )}
        </div>
    )
}
