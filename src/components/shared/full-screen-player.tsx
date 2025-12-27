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
    imageUrl?: string | null
    waveformPeaks?: number[] | null
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
                {/* Album Art */}
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
