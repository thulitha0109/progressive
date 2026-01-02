"use client"

import Image from "next/image"

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

interface FeaturedItem {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    likesCount: number
    isLiked: boolean
    artist?: {
        id: string
        name: string
        imageUrl?: string | null
    } | null
    assignedSequence?: number | null
    type?: 'TRACK' | 'PODCAST'
}

export function FeaturedSection({ item }: { item: FeaturedItem }) {
    const { currentTrack, isPlaying, togglePlay, playTrack } = usePlayer()
    const [progress, setProgress] = useState(0)

    const isCurrentTrack = currentTrack?.id === item.id
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
            // Need to ensure item has all Track properties required by playTrack
            // For now casting, but playTrack might need type update or item normalization
            playTrack(item as any)
        }
    }

    // We no longer need to hold back the content, as the LiquidBackground now has a static fallback
    // that renders immediately. This fixes the "double load" / invisible content issue.

    const artistName = item.artist?.name || "Progressive.lk"
    const artistImage = item.artist?.imageUrl || null
    const sequence = item.assignedSequence ? String(item.assignedSequence).padStart(3, '0') : "001"

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
                <div className="absolute inset-0 bg-gradient-to-r from-background/0 to-background dark:from-background/0 dark:to-background pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/0 dark:from-background dark:via-background/20 dark:to-background/0 pointer-events-none" />
            </div>

            <div className="container px-4 md:px-6 relative z-10 py-12 pointer-events-none">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-6 items-end">
                    {/* Left Side: Content - Text Data (Order 2 on Mobile, 1 on Desktop) */}
                    <div className="flex flex-col space-y-6 md:space-y-8 lg:items-end lg:text-right pointer-events-none lg:mb-12 order-2 lg:order-1">
                        {/* Wrapper div for content to allow pointer events on text if needed, but mainly visual */}
                        <div className="pointer-events-auto w-full flex flex-col items-end space-y-8">

                            {/* Artist Info (Vertical Layout: Image -> Name) */}
                            <div className="flex flex-col items-end space-y-6">
                                <div className="relative h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
                                    {artistImage ? (
                                        <Image
                                            src={artistImage}
                                            alt={artistName}
                                            fill
                                            className="object-cover"
                                            sizes="128px"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-muted flex items-center justify-center">
                                            <span className="text-xl font-bold text-muted-foreground">
                                                {artistName[0]}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl md:text-3xl font-light text-foreground/80 tracking-wide">
                                    {artistName}
                                </h3>
                            </div>

                            {/* Track Info (NOW ON BOTTOM) */}
                            <div className="space-y-4 flex flex-col lg:items-end w-full">
                                <div className="relative inline-block text-right">
                                    <h1
                                        className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter text-foreground drop-shadow-2xl relative z-10 leading-[0.9]"
                                    >
                                        {item.title}
                                    </h1>
                                </div>

                                <div className="flex items-center gap-4 justify-end w-full mt-4">
                                    <span className="text-primary font-medium tracking-widest uppercase text-sm md:text-base px-3 py-1 rounded border border-[#487cff] text-[#487cff]">
                                        {sequence} <span className="mx-2 text-muted-foreground/50">|</span> FEATURED {item.type || 'TRACK'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Player Card - (Order 1 on Mobile, 2 on Desktop) */}
                    <div className="relative w-full max-w-md mx-auto lg:ml-auto lg:mb-12 cursor-pointer pointer-events-auto order-1 lg:order-2" onClick={handleImageClick}>
                        <div className="relative aspect-square rounded-md overflow-hidden shadow-2xl group border border-white/10 bg-black/50 backdrop-blur-md">
                            {item.imageUrl || (item.artist && item.artist.imageUrl) ? (
                                <Image
                                    src={item.imageUrl || item.artist?.imageUrl || ""}
                                    alt={item.title}
                                    fill
                                    className={cn(
                                        "object-cover transition-all duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100",
                                        isCurrentTrack && isPlaying && "scale-105 opacity-100"
                                    )}
                                    priority
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            ) : (
                                <div className="w-full h-full bg-secondary flex items-center justify-center">
                                    No Image
                                </div>
                            )}

                            {/* Center Overlay: Waveform Only (Bottom Middle) - Visible ONLY when playing */}
                            {isCurrentTrack && isPlaying && (
                                <div className="absolute bottom-12 left-0 right-0 flex justify-center z-10 pointer-events-none">
                                    <div className="animate-in fade-in duration-300">
                                        <WaveformBar isPlaying={true} count={16} height="h-8" color="bg-white" />
                                    </div>
                                </div>
                            )}

                            {/* Play Overlay - Always Visible */}
                            <div className={cn(
                                "absolute inset-0 flex items-center justify-center z-20",
                                isCurrentTrack && isPlaying ? "bg-black/40" : ""
                            )}>
                                <div className={cn(
                                    "rounded-full bg-black/30 backdrop-blur-xl p-6 border border-white/20 hover:scale-110 transition-transform hover:bg-black/50"
                                )}>
                                    <PlayButton track={item as any} variant="icon" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
