"use client"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ChevronDown, Pause, Play, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { Waveform } from "@/components/shared/waveform"

interface Track {
    id: string
    title: string
    audioUrl: string
    artist: {
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
                "fixed inset-0 z-[60] flex flex-col bg-background transition-transform duration-300 ease-in-out",
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
                {/* Album Art */}
                <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-xl shadow-2xl md:max-w-md">
                    {track.artist?.imageUrl ? (
                        <img
                            src={track.artist.imageUrl}
                            alt={track.artist?.name || "Artist"}
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

                {/* Waveform */}
                <div className="w-full max-w-2xl space-y-4">
                    <div className="h-32 w-full flex items-center justify-center rounded-md bg-muted/20 p-4">
                        {track.audioUrl && audioElement && (
                            <Waveform
                                audioUrl={track.audioUrl}
                                media={audioElement}
                                height={100}
                                waveColor="#52525b" // zinc-600
                                progressColor="#fafafa" // zinc-50
                            />
                        )}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground px-1">
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
