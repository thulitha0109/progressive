"use client"

import Image from "next/image"

import { usePlayer } from "@/components/shared/player-context"
import { LikeButton } from "@/components/shared/like-button"
import { PlayButton } from "@/components/shared/play-button"
import { User, Calendar, Share2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { WaveformBar } from "@/components/shared/waveform-bar"
import { toast } from "sonner"

export interface ReleaseItem {
    id: string
    title: string
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
    artist: {
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

export function NewReleaseCard({ track, podcast, hideLikeButton = false }: { track?: ReleaseItem, podcast?: ReleaseItem, hideLikeButton?: boolean }) {
    const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer()

    const item = track || podcast
    if (!item) return null

    const isCurrentTrack = currentTrack?.id === item.id

    const isUpcoming = new Date(item.scheduledFor) > new Date()

    const handleCardClick = () => {
        if (isUpcoming) return

        if (isCurrentTrack) {
            togglePlay()
        } else {
            // Ensure we are passing the podcast kind if it's a podcast
            if (podcast && !item.kind) {
                // @ts-ignore - injecting kind for player if missing
                playTrack({ ...item, kind: 'PODCAST' })
            } else {
                playTrack(item)
            }
        }
    }

    // Determine Genre Data
    const genreName = item.genreRel?.name || item.genre
    const parentGenreName = item.genreRel?.parent?.name

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
            <div className="relative w-28 sm:w-40 self-stretch shrink-0 overflow-hidden rounded-md shadow-lg isolate ring-1 ring-white/10 ring-inset">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent z-10 pointer-events-none" />
                {item.imageUrl || item.artist.imageUrl ? (
                    <Image
                        src={item.imageUrl || item.artist.imageUrl || ""}
                        alt={item.title}
                        fill
                        className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-110"
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
                        "absolute inset-0 flex items-center justify-center bg-black/40 z-20 transition-all duration-300 backdrop-blur-[2px]",
                        isCurrentTrack && isPlaying ? "opacity-100 bg-black/60" : "opacity-0 group-hover:opacity-100"
                    )}>
                        <PlayButton track={item} variant="icon" />
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
                <div className="flex justify-between items-start w-full pb-1">
                    <div className="flex items-center gap-2">
                        {item.type && (
                            <div className={cn(
                                "flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border text-background",
                                item.type === "Warm" && "bg-yellow-500 border-yellow-400",
                                item.type === "Drive" && "bg-orange-500 border-orange-400",
                                item.type === "Peak" && "bg-red-500 border-red-400",
                                // Fallback for Track types (Remix, Bootleg, etc)
                                !["Warm", "Drive", "Peak"].includes(item.type) && "bg-primary border-primary text-primary-foreground"
                            )}>
                                <span>{item.type}</span>
                            </div>
                        )}
                    </div>

                    {!hideLikeButton && (
                        <div className="flex items-center gap-2">
                            {(item.kind === "PODCAST" || podcast) && (
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        const url = `${window.location.origin}/podcasts/${item.id}` // Assuming individual podcast page exists? Or just share site?
                                        // Wait, do we have /podcasts/[id] pages? Implementation plan didn't create them.
                                        // But `getPodcasts` exists.
                                        // If no individual page, maybe share `/podcasts`?
                                        // Let's assume generic share for now or `/`.
                                        // Actually better to share the main link if no deep link.
                                        // But usually share implies deep link.
                                        // I'll assume /podcasts exists or will exist, or share abstractly.
                                        // Let's check if [id] page exists. I recalled seeing `admin`, `podcasts/page.tsx`.
                                        // `src/app/podcasts/[id]/page.tsx`? I haven't seen it in search.
                                        // If it doesn't exist, I should probably just share the title/artist.
                                        // Let's stick to copying a title/artist string if no URL?
                                        // Or simply share the site URL.
                                        // "Add a working social share button".
                                        // I'll implement `navigator.share` with title and text.
                                        const shareData = {
                                            title: item.title,
                                            text: `Check out ${item.title} by ${item.artist.name} on Progressive.lk`,
                                            url: window.location.href // Fallback to current page
                                        }
                                        if (navigator.share) {
                                            navigator.share(shareData).catch(console.error)
                                        } else {
                                            navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`)
                                            toast.success("Link copied to clipboard")
                                        }
                                    }}
                                    className="transform transition-transform active:scale-95 text-muted-foreground hover:text-primary cursor-pointer p-1"
                                >
                                    <Share2 className="h-4 w-4" />
                                </div>
                            )}
                            <div onClick={(e) => e.stopPropagation()} className="transform transition-transform active:scale-95 text-muted-foreground hover:text-red-500">
                                <LikeButton
                                    trackId={item.id}
                                    initialLikes={item.likesCount}
                                    initialIsLiked={item.isLiked}
                                    type={item.kind === "PODCAST" || podcast ? "PODCAST" : "TRACK"}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Track Title */}
                <h3 className={cn(
                    "font-bold text-lg sm:text-2xl md:text-3xl truncate leading-tight transition-colors tracking-tight pr-4 py-1",
                    isCurrentTrack ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                    {item.title}
                </h3>

                {/* Artist & Genres */}
                <div className="flex flex-col gap-1.5">
                    <p className="text-sm sm:text-base text-muted-foreground font-medium truncate flex items-center gap-2">
                        {item.artist.name}
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
                                    "inline-block px-2 py-0.5 bg-background/50 dark:bg-black/40 backdrop-blur-md rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
                                    getGenreBorderColor(parentGenreName)
                                )}>
                                    {parentGenreName}
                                </span>
                            )}
                            {genreName && (
                                <span className={cn(
                                    "inline-block px-2 py-0.5 bg-background/50 dark:bg-black/40 backdrop-blur-md rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border text-muted-foreground hover:text-foreground transition-colors",
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
