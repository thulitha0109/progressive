"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

import { usePlayer } from "@/components/shared/player-context"
import { LikeButton } from "@/components/shared/like-button"
import { PlayButton } from "@/components/shared/play-button"
import { ShareMenu } from "@/components/shared/share-menu"
import { User, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WaveformBar } from "@/components/shared/waveform-bar"


export interface ReleaseItem {
    id: string
    title: string
    slug?: string
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    genre?: string | null
    type: string | null
    genreRel?: {
        name: string
        parent?: {
            name: string
        }
    } | null
    likesCount: number
    isLiked: boolean
    kind?: "TRACK" | "PODCAST"
    sequence?: number | null
    artist: {
        id: string
        name: string
        imageUrl?: string | null
        slug?: string
    }
}

const GENRE_BORDERS: Record<string, string> = {
    "Progressive": "border-blue-500/50 hover:border-blue-500",
    "Melodic": "border-cyan-500/50 hover:border-cyan-500",
    "Techno": "border-purple-500/50 hover:border-purple-500",
    "Peak Time": "border-fuchsia-500/50 hover:border-fuchsia-500",
    "House": "border-orange-500/50 hover:border-orange-500",
    "Deep House": "border-amber-500/50 hover:border-amber-500",
    "Trance": "border-pink-500/50 hover:border-pink-500",
    "Electronica": "border-emerald-500/50 hover:border-emerald-500",
    "Organic": "border-green-500/50 hover:border-green-500",
    "Drum & Bass": "border-yellow-500/50 hover:border-yellow-500",
    "Liquid": "border-lime-500/50 hover:border-lime-500",
    "Ambient": "border-teal-500/50 hover:border-teal-500",
    "Chillout": "border-indigo-500/50 hover:border-indigo-500",
}

function getGenreBorderColor(genre: string) {
    const key = Object.keys(GENRE_BORDERS).find(k => genre.includes(k))
    return key ? GENRE_BORDERS[key] : "border-white/10 hover:border-white/30"
}

export function NewReleaseCard({ track, hideLikeButton = false }: { track: ReleaseItem, hideLikeButton?: boolean }) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()
    const [likesState, setLikesState] = useState({
        likesCount: track.likesCount,
        isLiked: track.isLiked
    })

    useEffect(() => {
        setLikesState({
            likesCount: track.likesCount,
            isLiked: track.isLiked
        })
    }, [track.likesCount, track.isLiked])

    if (!track) return null

    const isCurrentTrack = currentTrack?.id === track.id

    const isUpcoming = new Date(track.scheduledFor) > new Date()

    const handleCardClick = () => {
        if (isUpcoming) return

        if (isCurrentTrack) {
            togglePlay()
        } else {
            playTrack({ ...track, ...likesState })
        }
    }

    // Determine Genre Data
    const genreName = track.genreRel?.name || track.genre
    const parentGenreName = track.genreRel?.parent?.name

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group/card relative flex flex-row gap-2 sm:gap-6 rounded-md border border-white/5 bg-[#121212] hover:bg-[#1a1a1a] transition-colors duration-500 cursor-pointer overflow-hidden hover:shadow-2xl h-28 sm:h-40",
                isCurrentTrack && isPlaying ? "bg-[#1a1a1a] border-primary/30" : ""
            )}
        >
            {/* Absolute Glow Background / Shade */}
            <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-linear-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Image Section */}
            <div className="relative w-28 sm:w-40 h-full shrink-0 overflow-hidden rounded-l-md rounded-r-none shadow-lg isolate ring-1 ring-white/10 ring-inset">
                <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent z-10 pointer-events-none" />
                {track.imageUrl || track.artist?.imageUrl ? (
                    <Image
                        src={track.imageUrl || track.artist?.imageUrl || ""}
                        alt={track.title}
                        fill
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover/card:scale-110"
                        sizes="(max-width: 640px) 112px, 160px"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}

                {/* Overlay Play Button */}
                {!isUpcoming && (
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center z-20 transition-all duration-300",
                        isCurrentTrack && isPlaying ? "opacity-100 bg-black/40" : "opacity-0 group-hover/card:opacity-100 bg-black/20"
                    )}>
                        <PlayButton track={track} variant="glass" className="h-10 w-10 sm:h-12 sm:w-12" />
                    </div>
                )}
                {isUpcoming && (
                    <div className={cn(
                        "absolute inset-0 flex flex-col gap-1 items-center justify-center bg-black/60 z-20 transition-all duration-300 backdrop-blur-[2px] opacity-0 group-hover/card:opacity-100",
                    )}>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/80">Coming</span>
                        <span className="text-xs font-bold uppercase tracking-wider text-white border border-white/50 px-2 py-1 rounded-md bg-black/40">
                            {new Date(track.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                )}
            </div>

            {/* Info Section - Right */}
            <div className="flex flex-col justify-between h-full min-w-0 flex-1 z-10 relative py-2 pr-2 sm:py-3 sm:pr-4">
                {/* Top Row: Date (Left) and Like (Right) */}
                <div className="flex justify-between items-center w-full pb-0.5">
                    <div className="flex items-center gap-2">
                        {track.type && (
                            <div className={cn(
                                "flex items-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border text-background",
                                track.type === "Warm" && "bg-yellow-500 border-yellow-400",
                                track.type === "Drive" && "bg-orange-500 border-orange-400",
                                track.type === "Peak" && "bg-red-500 border-red-400",
                                // Fallback for Track types (Remix, Bootleg, etc)
                                !["Warm", "Drive", "Peak"].includes(track.type) && "bg-primary border-primary text-primary-foreground"
                            )}>
                                <span>{track.type}</span>
                            </div>
                        )}
                    </div>

                    {!hideLikeButton && (
                        <div className="flex items-center gap-2 ml-auto">
                            <ShareMenu
                                url={`${process.env.NEXT_PUBLIC_APP_URL || "https://progressive.lk"}/${track.kind === "PODCAST" ? "podcasts" : "tracks"}/${track.slug || track.id}`}
                                title={track.title}
                                text={`Check out ${track.title} by ${track.artist?.name || "Unknown Artist"} on Progressive.lk`}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="swiper-no-swiping transform transition-transform active:scale-95 text-muted-foreground hover:text-primary cursor-pointer p-1"
                                >
                                    <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </div>
                            </ShareMenu>
                            <div onClick={(e) => e.stopPropagation()} className="transform transition-transform active:scale-95 text-muted-foreground hover:text-red-500">
                                <LikeButton
                                    trackId={track.id}
                                    initialLikes={track.likesCount}
                                    initialIsLiked={track.isLiked}
                                    type="TRACK"
                                    onToggle={(isLiked, likesCount) => setLikesState({ isLiked, likesCount })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Track Title & Artist - Middle */}
                <div className="flex-1 flex flex-col justify-center min-h-0 gap-0.5">
                    <h3 className={cn(
                        "font-bold text-sm sm:text-xl truncate leading-tight transition-colors tracking-tight pr-4 w-full",
                        isCurrentTrack ? "text-primary" : "text-foreground group-hover/card:text-primary"
                    )}>
                        {track.title}
                    </h3>
                    <p className="text-[11px] sm:text-sm text-muted-foreground font-medium truncate flex items-center gap-2">
                        {track.artist?.name || "Unknown Artist"}
                        {isCurrentTrack && isPlaying && (
                            <span className="flex h-1.5 w-1.5 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                            </span>
                        )}
                    </p>
                </div>

                {/* Genres - Bottom */}
                <div className="flex flex-col gap-1 mt-auto">
                    {/* Separate Genre Tags */}
                    {(genreName || parentGenreName) && (
                        <div className="flex flex-wrap gap-1">
                            {parentGenreName && (
                                <span className={cn(
                                    "inline-block px-1.5 py-0.5 bg-secondary/50 backdrop-blur-md rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
                                    getGenreBorderColor(parentGenreName)
                                )}>
                                    {parentGenreName}
                                </span>
                            )}
                            {genreName && (
                                <span className={cn(
                                    "inline-block px-1.5 py-0.5 bg-secondary/50 backdrop-blur-md rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
                                    getGenreBorderColor(genreName)
                                )}>
                                    {genreName}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Waveform */}
                {isCurrentTrack && isPlaying && (
                    <div className="absolute bottom-0 right-0 opacity-50">
                        <WaveformBar isPlaying={true} count={12} height="h-4 sm:h-6" color="bg-primary" />
                    </div>
                )}
            </div>
        </div>
    )
}

