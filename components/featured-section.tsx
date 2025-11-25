"use client"

import { PlayButton } from "@/components/play-button"
import { LikeButton } from "@/components/like-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { usePlayer } from "@/components/player-context"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    likesCount: number
    isLiked: boolean
    artist: {
        id: string
        name: string
        imageUrl?: string | null
    }
}

export function FeaturedSection({ track }: { track: Track }) {
    const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayer()
    const [progress, setProgress] = useState(0)

    const isCurrentTrack = currentTrack?.id === track.id

    // This is a visual approximation since we don't have direct access to the audio element's time here
    // In a real app, we'd want to expose currentTime/duration from the context or use a more complex setup
    // For now, we'll just show a static slider or a simple visual if it's playing

    return (
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-primary/10 via-background to-background">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
                    {/* Left Side: Artist & Track Info */}
                    <div className="flex flex-col justify-center space-y-4">
                        <div className="space-y-2">
                            <Badge variant="secondary" className="w-fit">Featured Track</Badge>
                            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                {track.title}
                            </h1>
                            <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                by <span className="font-semibold text-foreground">{track.artist.name}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="relative h-20 w-20 md:h-24 md:w-24 overflow-hidden rounded-full border-2 border-primary">
                                {track.artist.imageUrl ? (
                                    <img
                                        src={track.artist.imageUrl}
                                        alt={track.artist.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-muted" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(track.scheduledFor).toLocaleDateString()}
                                </div>
                                <LikeButton
                                    trackId={track.id}
                                    initialLikes={track.likesCount}
                                    initialIsLiked={track.isLiked}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Player UI */}
                    <Card className="w-full max-w-md mx-auto lg:ml-auto p-6 bg-card/50 backdrop-blur-sm border-primary/20 shadow-xl">
                        <div className="flex flex-col gap-6">
                            <div className="aspect-square w-full relative rounded-md overflow-hidden bg-muted shadow-inner">
                                {track.imageUrl || track.artist.imageUrl ? (
                                    <img
                                        src={track.imageUrl || track.artist.imageUrl || ""}
                                        alt={track.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-secondary flex items-center justify-center text-muted-foreground">
                                        No Image
                                    </div>
                                )}

                                {/* Overlay Play Button */}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors group">
                                    <div className="transform transition-transform group-hover:scale-110">
                                        <PlayButton track={track} variant="icon" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm font-medium">
                                    <span>{track.title}</span>
                                    <span className="text-muted-foreground">{track.artist.name}</span>
                                </div>
                                {/* Decorative Progress Bar */}
                                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={cn("h-full bg-primary transition-all duration-500", isCurrentTrack && isPlaying ? "w-full animate-pulse" : "w-0")}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </section>
    )
}
