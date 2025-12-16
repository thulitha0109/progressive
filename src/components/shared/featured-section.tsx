"use client"

import { PlayButton } from "@/components/shared/play-button"
import { LikeButton } from "@/components/shared/like-button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"
import { usePlayer } from "@/components/shared/player-context"
import { Slider } from "@/components/ui/slider"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { WaveformBar } from "@/components/shared/waveform-bar"
import { LiquidBackground } from "@/components/shared/liquid-background"

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
    const [mousePosition, setMousePosition] = useState<{ x: number; y: number } | null>(null)
    // Remove complex glitch state, replace with simple mouse tracking for liquid effect

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
        const x = (e.clientX - left)
        const y = (e.clientY - top)
        setMousePosition({ x, y })
    }

    const handleImageClick = () => {
        if (isCurrentTrack) {
            togglePlay()
        } else {
            playTrack(track)
        }
    }

    // We no longer need to hold back the content, as the LiquidBackground now has a static fallback
    // that renders immediately. This fixes the "double load" / invisible content issue.

    return (
        <section
            className="relative w-full overflow-hidden min-h-[700px] lg:min-h-screen flex items-end animate-enter-fade-in"
        >
            {/* Background Image - LEFT sided liquid */}
            <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 z-0 overflow-hidden">
                <LiquidBackground
                    imageUrl="/images/PNG-06.png"
                    className="absolute inset-0 w-full h-full"
                />

                {/* Overlays for depth - Pointer events none to allow BG interaction */}
                <div className="absolute inset-0 bg-gradient-to-r from-background/0 to-background dark:from-black/0 dark:to-black pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/0 dark:from-black dark:via-black/50 dark:to-black/0 pointer-events-none" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 py-12 pointer-events-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-end">
                    {/* Left Side: Content - Text Data (Order 2 on Mobile, 1 on Desktop) */}
                    <div className="flex flex-col space-y-6 md:space-y-8 lg:items-end lg:text-right pointer-events-none lg:mb-12 order-2 lg:order-1">
                        {/* Wrapper div for content to allow pointer events on text if needed, but mainly visual */}
                        <div className="pointer-events-auto w-full flex flex-col items-end space-y-8">

                            {/* Artist Info (NOW ON TOP) */}
                            <div className="flex items-center space-x-6 lg:flex-row-reverse lg:space-x-reverse">
                                <div className="relative h-16 w-16 md:h-20 md:w-20 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
                                    {track.artist.imageUrl ? (
                                        <img
                                            src={track.artist.imageUrl}
                                            alt={track.artist.name}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-muted flex items-center justify-center">
                                            <span className="text-xl font-bold text-muted-foreground">
                                                {track.artist.name[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <h3 className="text-2xl md:text-3xl font-light text-foreground/80 tracking-wide">
                                    {track.artist.name}
                                </h3>
                            </div>

                            {/* Track Info (NOW ON BOTTOM) */}
                            <div className="space-y-4 flex flex-col lg:items-end w-full">
                                <div className="flex items-center gap-4 justify-end w-full">
                                    <span className="text-primary font-medium tracking-widest uppercase text-sm md:text-base bg-primary/10 px-3 py-1 rounded-full backdrop-blur-sm border border-primary/20">
                                        Featured Track
                                    </span>
                                </div>

                                <div className="relative inline-block text-right">
                                    <h1
                                        className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter text-foreground drop-shadow-2xl relative z-10 leading-[0.9]"
                                    >
                                        {track.title}
                                    </h1>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Player Card - (Order 1 on Mobile, 2 on Desktop) */}
                    <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mb-12 cursor-pointer pointer-events-auto order-1 lg:order-2" onClick={handleImageClick}>
                        <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl group border border-white/10 bg-black/50 backdrop-blur-md">
                            {track.imageUrl || track.artist.imageUrl ? (
                                <img
                                    src={track.imageUrl || track.artist.imageUrl || ""}
                                    alt={track.title}
                                    className={cn(
                                        "w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100",
                                        isCurrentTrack && isPlaying && "scale-105 opacity-100"
                                    )}
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    No Image
                                </div>
                            )}

                            {/* Play Overlay */}
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center transition-all duration-300",
                                isCurrentTrack && isPlaying ? "opacity-0" : "opacity-100"
                            )}>
                                <div className="rounded-full bg-black/30 backdrop-blur-xl p-6 border border-white/20 hover:scale-110 transition-transform group-hover:bg-black/50">
                                    <PlayButton track={track} variant="icon" />
                                </div>
                            </div>

                            {/* Glassmorphism Overlay Detail */}
                            <div className="absolute top-6 left-6 right-6 flex justify-between items-start text-white/90 z-20 pointer-events-none">
                                <span className="font-bold text-lg tracking-tighter uppercase mix-blend-overlay opacity-70">Progressive.lk</span>
                            </div>

                            {/* Bottom Waveform & Info */}
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col justify-end h-1/2 pointer-events-none">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider text-white/60 mb-1">Now Featured</p>
                                        <p className="text-lg font-bold text-white tracking-wide">{track.artist.name}</p>
                                    </div>
                                    <WaveformBar isPlaying={isCurrentTrack && isPlaying} count={12} height="h-10" color="bg-primary" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
