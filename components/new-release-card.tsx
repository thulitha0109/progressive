"use client"

import { usePlayer } from "@/components/player-context"
import { LikeButton } from "@/components/like-button"
import { PlayButton } from "@/components/play-button"
import { User, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    genre?: string | null
    likesCount: number
    isLiked: boolean
    artist: {
        id: string
        name: string
        imageUrl?: string | null
    }
}

export function NewReleaseCard({ track }: { track: Track }) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
    const isCurrentTrack = currentTrack?.id === track.id

    const handleCardClick = () => {
        if (isCurrentTrack) {
            togglePlay()
        } else {
            playTrack(track)
        }
    }

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group relative flex items-center gap-3 rounded-lg border p-3 transition-colors cursor-pointer",
                isCurrentTrack && isPlaying ? "bg-accent/50 border-primary/50" : "hover:bg-accent/50"
            )}
        >
            {/* Image Section - Left */}
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                {track.imageUrl || track.artist.imageUrl ? (
                    <img
                        src={track.imageUrl || track.artist.imageUrl || ""}
                        alt={track.title}
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <User className="h-6 w-6 m-auto text-muted-foreground" />
                )}

                {/* Overlay Play Button (Visible on hover or when playing) */}
                <div className={cn(
                    "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                    isCurrentTrack && isPlaying ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                    <PlayButton track={track} variant="icon" />
                </div>
            </div>

            {/* Genre Tag - Absolute Top Right */}
            {track.genre && (
                <span className="absolute top-3 right-3 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                    {track.genre}
                </span>
            )}

            {/* Info Section - Right */}
            <div className="flex flex-1 flex-col justify-between min-h-[4rem]">
                {/* Top: Title & Artist */}
                <div className="mb-1 pr-16 relative">
                    <h3 className={cn("font-medium leading-none truncate", isCurrentTrack && "text-primary")}>
                        {track.title}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                        {track.artist.name}
                    </p>
                </div>

                {/* Bottom: Date & Like */}
                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(track.scheduledFor).toLocaleDateString()}
                    </div>

                    {/* Like Button - Stop Propagation handled inside component */}
                    <div onClick={(e) => e.stopPropagation()}>
                        <LikeButton
                            trackId={track.id}
                            initialLikes={track.likesCount}
                            initialIsLiked={track.isLiked}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}
