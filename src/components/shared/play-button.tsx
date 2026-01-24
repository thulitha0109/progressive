"use client"

import { usePlayer } from "@/components/shared/player-context"
import { Button } from "@/components/ui/button"
import { Play, Pause, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null // Add this to match PlayerContext
    artist: {
        id?: string
        name: string
        imageUrl?: string | null
    }
    scheduledFor?: Date | string
    // Extended properties for PlayerContext compatibility
    likesCount?: number
    isLiked?: boolean
    kind?: "TRACK" | "PODCAST"
    genre?: string | null
    duration?: number
    waveformPeaks?: number[] | null
}

export function PlayButton({
    track,
    variant = "default",
    ignoreReleaseDate = false,
    className
}: {
    track: Track,
    variant?: "default" | "ghost" | "icon" | "glass",
    ignoreReleaseDate?: boolean,
    className?: string
}) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()

    const isCurrentTrack = currentTrack?.id === track.id

    // Check if track is released
    const isReleased = !track.scheduledFor || new Date(track.scheduledFor) <= new Date()

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation if inside a link

        if (!isReleased && !ignoreReleaseDate) return

        if (isCurrentTrack) {
            togglePlay()
        } else {
            playTrack(track)
        }
    }

    if (!isReleased && !ignoreReleaseDate) {
        if (variant === "icon") {
            return (
                <Button
                    size="icon"
                    className="rounded-full h-10 w-10 opacity-50 cursor-not-allowed"
                    disabled
                    title={`Available on ${new Date(track.scheduledFor!).toLocaleDateString()}`}
                >
                    <Clock className="h-5 w-5 ml-0.5" />
                </Button>
            )
        }
        return (
            <Button size="sm" variant="secondary" disabled className="opacity-70 cursor-not-allowed">
                Upcoming
            </Button>
        )
    }

    if (variant === "glass") {
        return (
            <button
                onClick={handleClick}
                disabled={!isReleased && !ignoreReleaseDate}
                className={cn(
                    "rounded-full bg-black/30 backdrop-blur-xl border border-white/20 hover:scale-110 transition-transform hover:bg-black/50 group flex items-center justify-center text-white shadow-lg",
                    "h-12 w-12",
                    !isReleased && !ignoreReleaseDate && "opacity-50 cursor-not-allowed hover:scale-100 hover:bg-black/30",
                    className
                )}
            >
                {isCurrentTrack && isPlaying ? (
                    <Pause className="h-5 w-5 fill-white" />
                ) : (
                    <Play className="h-5 w-5 fill-white ml-0.5" />
                )}
            </button>
        )
    }

    if (variant === "icon") {
        return (
            <Button
                size="icon"
                className={cn("rounded-full h-10 w-10", className)}
                onClick={handleClick}
            >
                {isCurrentTrack && isPlaying ? (
                    <Pause className="h-5 w-5" />
                ) : (
                    <Play className="h-5 w-5 ml-0.5" />
                )}
            </Button>
        )
    }

    return (
        <Button size="sm" variant={variant} onClick={handleClick}>
            {isCurrentTrack && isPlaying ? "Pause" : "Play"}
        </Button>
    )
}
