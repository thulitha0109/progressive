"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Waveform } from "@/components/shared/waveform"
import { LikeButton } from "@/components/shared/like-button"
import { AddToPlaylistButton } from "@/components/shared/add-to-playlist-button"
import { FollowButton } from "@/components/artist/follow-button"

const GENRE_BORDERS: Record<string, string> = {
    "Progressive": "border-blue-500/50 text-blue-400 bg-blue-500/10",
    "Melodic": "border-cyan-500/50 text-cyan-400 bg-cyan-500/10",
    "Techno": "border-purple-500/50 text-purple-400 bg-purple-500/10",
    "Peak Time": "border-fuchsia-500/50 text-fuchsia-400 bg-fuchsia-500/10",
    "House": "border-orange-500/50 text-orange-400 bg-orange-500/10",
    "Deep House": "border-amber-500/50 text-amber-400 bg-amber-500/10",
    "Trance": "border-pink-500/50 text-pink-400 bg-pink-500/10",
    "Electronica": "border-emerald-500/50 text-emerald-400 bg-emerald-500/10",
    "Organic": "border-green-500/50 text-green-400 bg-green-500/10",
    "Drum & Bass": "border-yellow-500/50 text-yellow-400 bg-yellow-500/10",
    "Liquid": "border-lime-500/50 text-lime-400 bg-lime-500/10",
    "Ambient": "border-teal-500/50 text-teal-400 bg-teal-500/10",
    "Chillout": "border-indigo-500/50 text-indigo-400 bg-indigo-500/10",
}

function getGenreStyle(genre: string) {
    const key = Object.keys(GENRE_BORDERS).find(k => genre.includes(k))
    return key ? GENRE_BORDERS[key] : "border-white/10 text-muted-foreground bg-white/5"
}

interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    waveformPeaks?: number[] | null
    kind?: "TRACK" | "PODCAST"
    likesCount?: number
    isLiked?: boolean
    genre?: string | null
    type?: string | null
    sequence?: number | null
    genreRel?: {
        name: string
        parent?: {
            name: string
        }
    } | null
    artist: {
        id?: string
        name: string
        imageUrl?: string | null
    }
}

interface FullScreenPlayerProps {
    track: Track | null
    isPlaying: boolean
    togglePlay: () => void
    isOpen: boolean
    onClose: () => void
    currentTime: number
    duration: number
    onSeek: (value: number) => void
    volume: number
    onVolumeChange: (value: number) => void
    audioElement?: HTMLMediaElement | null
}

export function FullScreenPlayer({
    track,
    isPlaying,
    togglePlay,
    isOpen,
    onClose,
    currentTime,
    duration,
    onSeek,
    volume,
    onVolumeChange,
    audioElement,
}: FullScreenPlayerProps) {
    const [isMuted, setIsMuted] = useState(false)
    const [prevVolume, setPrevVolume] = useState(volume)

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, "0")}`
    }

    const toggleMute = () => {
        if (isMuted) {
            onVolumeChange(prevVolume)
            setIsMuted(false)
        } else {
            setPrevVolume(volume)
            onVolumeChange(0)
            setIsMuted(true)
        }
    }

    if (!track) return null

    return (
        <div
            className={cn(
                "fixed inset-0 z-[60] flex flex-col bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 transition-transform duration-300 ease-in-out",
                isOpen ? "translate-y-0" : "translate-y-full"
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                    <ChevronDown className="h-6 w-6" />
                </Button>
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                    Now Playing
                </span>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            {/* Main Content */}
            <div className="flex flex-1 flex-col items-center justify-center gap-8 p-4 md:p-8">
                {/* Album Art After Isuued fix*/}
                <div className="relative inline-block aspect-square max-h-[40vh] overflow-hidden rounded-md shadow-2xl">
                    {track.imageUrl || track.artist?.imageUrl ? (
                        <img
                            src={track.imageUrl || track.artist.imageUrl || ""}
                            alt={track.title || "Track"}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-4xl font-bold text-muted-foreground">
                                {track.title[0]}
                            </span>
                        </div>
                    )}
                </div>

                {/* Track Info & Actions */}
                <div className="flex flex-col items-center gap-4 text-center w-full">
                    <div className="space-y-1 w-full px-8">
                        <h2 className="text-2xl font-bold leading-tight truncate">{track.title}</h2>
                        <p className="text-lg text-muted-foreground truncate">{track.artist.name}</p>
                    </div>

                    {/* Metadata: Genres, Type, SQ No */}
                    <div className="flex flex-wrap items-center justify-center gap-2 px-4 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
                        {/* Parent Genre */}
                        {track.genreRel?.parent?.name && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border",
                                getGenreStyle(track.genreRel.parent.name)
                            )}>
                                {track.genreRel.parent.name}
                            </span>
                        )}

                        {/* Genre */}
                        {(track.genreRel?.name || track.genre) && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border",
                                getGenreStyle(track.genreRel?.name || track.genre || "")
                            )}>
                                {track.genreRel?.name || track.genre}
                            </span>
                        )}

                        {/* Type */}
                        {track.type && (
                            <span className={cn(
                                "px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border",
                                track.type === "Warm" && "bg-yellow-500/10 border-yellow-500/50 text-yellow-500",
                                track.type === "Drive" && "bg-orange-500/10 border-orange-500/50 text-orange-500",
                                track.type === "Peak" && "bg-red-500/10 border-red-500/50 text-red-500",
                                !["Warm", "Drive", "Peak"].includes(track.type) && "bg-secondary/50 border-white/10 text-foreground"
                            )}>
                                {track.type}
                            </span>
                        )}

                        {/* SQ Number */}
                        {track.sequence && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-muted-foreground">
                                #{track.sequence.toString().padStart(3, '0')}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="scale-125">
                            <LikeButton
                                trackId={track.id}
                                type={track.kind || "TRACK"}
                                initialLikes={track.likesCount || 0}
                                initialIsLiked={track.isLiked || false}
                            />
                        </div>

                        <div className="scale-110">
                            <AddToPlaylistButton trackId={track.id} />
                        </div>

                        {track.artist.id && (
                            <div className="scale-110">
                                <FollowButton
                                    artistId={track.artist.id}
                                    showText={false}
                                    checkStatus={true}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Waveform */}
                <div className="w-full max-w-2xl space-y-3 sm:space-y-4">
                    <div className="h-24 sm:h-28 md:h-32 lg:h-24 xl:h-20 w-full flex items-center justify-center rounded-md bg-muted/20 p-3 sm:p-4">
                        {track.audioUrl && audioElement && duration > 0 && (
                            <Waveform
                                audioUrl={track.audioUrl}
                                media={audioElement}
                                height={64}
                                waveColor="#52525b"
                                progressColor="#fafafa"
                                peaks={track.waveformPeaks as number[] | undefined}
                                duration={duration}
                            />
                        )}
                    </div>

                    <div className="flex justify-between px-1 text-xs text-muted-foreground">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-6 md:gap-10">
                    <Button variant="ghost" size="icon" className="h-12 w-12">
                        <SkipBack className="h-8 w-8" />
                    </Button>
                    <Button
                        size="icon"
                        className="h-16 w-16 rounded-full shadow-lg"
                        onClick={togglePlay}
                    >
                        {isPlaying ? (
                            <Pause className="h-8 w-8" />
                        ) : (
                            <Play className="h-8 w-8 ml-1" />
                        )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-12 w-12">
                        <SkipForward className="h-8 w-8" />
                    </Button>
                </div>

                {/* Volume Control */}
                <div className="flex w-full max-w-xs items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={toggleMute}>
                        {isMuted || volume === 0 ? (
                            <VolumeX className="h-5 w-5" />
                        ) : (
                            <Volume2 className="h-5 w-5" />
                        )}
                    </Button>
                    <Slider
                        value={[isMuted ? 0 : volume]}
                        max={1}
                        step={0.01}
                        onValueChange={(value: number[]) => {
                            setIsMuted(false)
                            onVolumeChange(value[0])
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
