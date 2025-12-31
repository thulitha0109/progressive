
"use client"

import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { UserCheck, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface FollowButtonProps {
    artistId: string
    className?: string
    showText?: boolean
}

export function FollowButton({ artistId, className, showText = true }: FollowButtonProps) {
    const { data: session } = useSession()
    const [isFollowing, setIsFollowing] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    useEffect(() => {
        if (session?.user) {
            checkFollowStatus()
        }
    }, [artistId, session])

    async function checkFollowStatus() {
        try {
            const res = await fetch(`/api/artists/${artistId}/follow`)
            if (res.ok) {
                const data = await res.json()
                setIsFollowing(data.followed)
            }
        } catch (error) {
            console.error("Failed to check follow status", error)
        }
    }

    async function toggleFollow() {
        if (!session?.user) {
            toast.error("Please login to follow artists")
            router.push(`/auth/login?callbackUrl=${encodeURIComponent(window.location.href)}`)
            return
        }

        setIsLoading(true)
        try {
            const res = await fetch(`/api/artists/${artistId}/follow`, {
                method: "POST"
            })

            if (res.ok) {
                const data = await res.json()
                setIsFollowing(data.followed)
                toast.success(data.followed ? "Following artist" : "Unfollowed artist")
                router.refresh()
            } else {
                toast.error("Something went wrong")
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to update follow status")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            variant="ghost"
            size={showText ? "sm" : "icon"}
            onClick={toggleFollow}
            disabled={isLoading}
            className={cn(showText ? "gap-2" : "rounded-full h-8 w-8 hover:bg-white/10 hover:text-white", className)}
        >
            {isFollowing ? (
                <UserCheck className={cn("h-4 w-4", "text-primary fill-current")} />
            ) : (
                <UserPlus className={cn("h-4 w-4", "text-muted-foreground group-hover:text-primary")} />
            )}
            {showText && (isFollowing ? "Following" : "Follow")}
        </Button>
    )
}
