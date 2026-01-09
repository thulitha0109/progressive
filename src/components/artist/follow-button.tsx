"use client"

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useState, useTransition } from "react"
import { UserCheck, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { toggleFollowArtist } from "@/server/actions/social"

interface FollowButtonProps {
    artistId: string
    className?: string
    showText?: boolean
    initialIsFollowing?: boolean
}

export function FollowButton({ artistId, className, showText = true, initialIsFollowing = false }: FollowButtonProps) {
    const { data: session } = useSession()
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    async function handleToggle() {
        if (!session?.user) {
            toast.error("Please login to follow artists")
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
            return
        }

        const previousState = isFollowing
        setIsFollowing(!isFollowing) // Optimistic update

        startTransition(async () => {
            try {
                const result = await toggleFollowArtist(artistId)
                setIsFollowing(result.isFollowing)
                toast.success(result.isFollowing ? "Following artist" : "Unfollowed artist")
                router.refresh()
            } catch (error) {
                console.error(error)
                setIsFollowing(previousState) // Revert on error
                toast.error("Failed to update follow status")
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
                <UserCheck className={cn("h-4 w-4", "text-primary fill-current")} />
            ) : (
                <UserPlus className={cn("h-4 w-4", "text-muted-foreground group-hover:text-primary")} />
            )}
            {showText && <span className="ml-2">{isFollowing ? "Following" : "Follow"}</span>}
        </Button>
    )
}
