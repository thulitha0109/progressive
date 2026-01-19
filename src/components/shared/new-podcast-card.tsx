"use client"

import Image from "next/image"
import { usePlayer } from "@/components/shared/player-context"
import { LikeButton } from "@/components/shared/like-button"
import { PlayButton } from "@/components/shared/play-button"
import { ShareMenu } from "@/components/shared/share-menu"
import { User, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WaveformBar } from "@/components/shared/waveform-bar"

export interface PodcastItem {
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
    kind?: "TRACK" | "PODCAST" // Optional but helpful for types
    artist?: {
        id: string
        name: string
        imageUrl?: string | null
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

export function NewPodcastCard({ podcast, hideLikeButton = false }: { podcast: PodcastItem, hideLikeButton?: boolean }) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()

    if (!podcast) return null

    const isCurrentTrack = currentTrack?.id === podcast.id
    const isUpcoming = new Date(podcast.scheduledFor) > new Date()

    const handleCardClick = () => {
        if (isUpcoming) return

        if (isCurrentTrack) {
            togglePlay()
        } else {
            // Force kind to PODCAST if missing
            // @ts-ignore
            playTrack({ ...podcast, kind: 'PODCAST' })
        }
    }

    // Determine Genre Data
    const genreName = podcast.genreRel?.name || podcast.genre
    const parentGenreName = podcast.genreRel?.parent?.name

    return (
        <div
            onClick={handleCardClick}
            className={cn(
                "group relative grid grid-cols-[auto_1fr] gap-4 sm:gap-6 rounded-md border border-white/5 bg-white/[0.01] hover:bg-white/[0.05] backdrop-blur-sm transition-colors duration-500 cursor-pointer overflow-hidden hover:shadow-2xl min-h-[110px] sm:min-h-[140px]",
                isCurrentTrack && isPlaying ? "bg-white/[0.08] border-primary/30" : ""
            )}
        >
            {/* Absolute Glow Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Image Section */}
            <div className="relative h-full w-auto aspect-square shrink-0 overflow-hidden rounded-md shadow-lg isolate ring-1 ring-white/10 ring-inset">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10 pointer-events-none" />
                {podcast.imageUrl || podcast.artist?.imageUrl ? (
                    <Image
                        src={podcast.imageUrl || podcast.artist?.imageUrl || ""}
                        alt={podcast.title}
                        fill
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(max-height: 160px) 160px, 112px"
                    />
                ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                )}

                {/* Overlay Play Button */}
                {!isUpcoming && (
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/40 z-20 transition-all duration-300 backdrop-blur-[2px]",
                        isCurrentTrack && isPlaying ? "opacity-100 bg-black/60" : "opacity-0 group-hover:opacity-100"
                    )}>
                        {/* We cast podcast to any or Track for PlayButton compatibility if needed, though PlayButton might accept generic Track-like shape */}
                        <PlayButton track={podcast as any} variant="icon" />
                    </div>
                )}
                {isUpcoming && (
                    <div className={cn(
                        "absolute inset-0 flex items-center justify-center bg-black/40 z-20 transition-all duration-300 backdrop-blur-[2px] opacity-0 group-hover:opacity-100",
                    )}>
                        <span className="text-xs font-bold uppercase tracking-wider text-white border border-white/50 px-2 py-1 rounded-md">
                            Coming Soon
                        </span>
                    </div>
                )}
            </div>

            {/* Info Section - Right */}
            <div className="flex flex-col justify-between h-full min-w-0 z-10 relative py-3 pr-3 sm:py-4 sm:pr-4">
                {/* Top Row: Date (Left) and Like (Right) */}
                <div className="flex justify-between items-center w-full pb-1">
                    <div className="flex items-center gap-2">
                        {podcast.type && (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border text-background",
                                podcast.type === "Warm" && "bg-yellow-500 border-yellow-400",
                                podcast.type === "Drive" && "bg-orange-500 border-orange-400",
                                podcast.type === "Peak" && "bg-red-500 border-red-400",
                                // Fallback
                                !["Warm", "Drive", "Peak"].includes(podcast.type) && "bg-primary border-primary text-primary-foreground"
                            )}>
                                <span>{podcast.type}</span>
                            </div>
                        )}
                    </div>

                    {!hideLikeButton && (
                        <div className="flex items-center gap-2">
                            <ShareMenu
                                url={`${process.env.NEXT_PUBLIC_APP_URL || "https://progressive.lk"}/podcasts/${podcast.slug || podcast.id}`}
                                title={podcast.title}
                                text={`Check out ${podcast.title} by ${podcast.artist?.name || "Unknown Artist"} on Progressive.lk`}
                            >
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="transform transition-transform active:scale-95 text-muted-foreground hover:text-primary cursor-pointer p-1"
                                >
                                    <Share2 className="h-4 w-4" />
                                </div>
                            </ShareMenu>
                            <div onClick={(e) => e.stopPropagation()} className="transform transition-transform active:scale-95 text-muted-foreground hover:text-red-500">
                                <LikeButton
                                    trackId={podcast.id}
                                    initialLikes={podcast.likesCount}
                                    initialIsLiked={podcast.isLiked}
                                    type="PODCAST"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Podcast Title */}
                <h3 className={cn(
                    "font-bold text-base sm:text-2xl md:text-3xl truncate leading-tight transition-colors tracking-tight pr-4 py-1",
                    isCurrentTrack ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                    {podcast.title}
                </h3>

                {/* Artist & Genres */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-xs sm:text-base text-muted-foreground font-medium truncate flex items-center gap-2">
                        {podcast.artist?.name || "Unknown Artist"}
                        {isCurrentTrack && isPlaying && (
                            <span className="flex h-2 w-2 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                        )}
                    </p>

                    {/* Separate Genre Tags */}
                    {(genreName || parentGenreName) && (
                        <div className="flex flex-wrap gap-1.5">
                            {parentGenreName && (
                                <span className={cn(
                                    "inline-block px-2 py-0.5 bg-secondary/50 backdrop-blur-md rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
                                    getGenreBorderColor(parentGenreName)
                                )}>
                                    {parentGenreName}
                                </span>
                            )}
                            {genreName && (
                                <span className={cn(
                                    "inline-block px-2 py-0.5 bg-secondary/50 backdrop-blur-md rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
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
                        <WaveformBar isPlaying={true} count={12} height="h-5 sm:h-8" color="bg-primary" />
                    </div>
                )}
            </div>
        </div>
    )
}
