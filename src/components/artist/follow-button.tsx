"use client"

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState, useTransition, useEffect } from "react"
import { UserCheck, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { toggleFollowArtist, getArtistFollowStatus } from "@/server/actions/social"
import { useUserActions } from "@/contexts/user-actions-context"
import { usePlayer } from "@/components/shared/player-context"

interface FollowButtonProps {
    artistId: string
    className?: string
    showText?: boolean
    initialIsFollowing?: boolean
    checkStatus?: boolean
    iconClassName?: string
}

export function FollowButton({ artistId, className, showText = true, initialIsFollowing = false, checkStatus = false, iconClassName }: FollowButtonProps) {
    const { data: session } = useSession()
    const { followStates, initializeFollowState, handleToggleFollow } = useUserActions()
    const { setIsFullScreen } = usePlayer()
    const isFollowing = followStates[artistId] ?? initialIsFollowing
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    useEffect(() => {
        initializeFollowState(artistId, initialIsFollowing)
    }, [artistId, initialIsFollowing, initializeFollowState])

    useEffect(() => {
        if (checkStatus && session?.user && artistId) {
            getArtistFollowStatus(artistId).then(data => {
                if (data) {
                    // Update global state with fetched status
                    initializeFollowState(artistId, data.isFollowing)
                }
            }).catch(err => console.error(err))
        }
    }, [artistId, checkStatus, session?.user, initializeFollowState])

    async function handleToggle(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        if (!session?.user) {
            setIsFullScreen(false)
            toast.error("Please login to follow artists")
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
            return
        }

        startTransition(async () => {
            const result = await handleToggleFollow(artistId)
            if (result === "Unauthorized") {
                setIsFullScreen(false)
                toast.error("Please login to follow artists")
                router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
            } else if (typeof result === "string") {
                toast.error(result)
            } else {
                toast.success(!isFollowing ? "Following artist" : "Unfollowed artist")
                router.refresh()
            }
        })
    }

    return (
        <Button
            variant="ghost"
            size={showText ? "sm" : "icon"}
            onClick={handleToggle}
            disabled={isPending}
            className={cn(showText ? "gap-2" : "rounded-full h-8 w-8 hover:bg-white/10 hover:text-white", className)}
        >
            {isFollowing ? (
                <UserCheck className={cn("h-4 w-4", "text-primary fill-current", iconClassName)} />
            ) : (
                <UserPlus className={cn("h-4 w-4", "text-muted-foreground group-hover:text-primary", iconClassName)} />
            )}
            {showText && <span className="ml-2">{isFollowing ? "Following" : "Follow"}</span>}
        </Button>
    )
}
