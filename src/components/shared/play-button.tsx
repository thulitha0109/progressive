"use client"

import { usePlayer } from "@/components/shared/player-context"
import { Button } from "@/components/ui/button"
import { Play, Pause } from "lucide-react"

interface Track {
    id: string
    title: string
    audioUrl: string
    artist: {
        id?: string
        name: string
        imageUrl?: string | null
    }
}

export function PlayButton({ track, variant = "default" }: { track: Track, variant?: "default" | "ghost" | "icon" }) {
    const { currentTrack, isPlaying, playTrack, togglePlay } = usePlayer()

    const isCurrentTrack = currentTrack?.id === track.id

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault() // Prevent link navigation if inside a link
        if (isCurrentTrack) {
            togglePlay()
        } else {
            playTrack(track)
        }
    }

    if (variant === "icon") {
        return (
            <Button
                size="icon"
                className="rounded-full h-10 w-10"
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
