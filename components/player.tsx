"use client"

import { usePlayer } from "@/components/player-context"
import { Button } from "@/components/ui/button"
import { Pause, Play, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FullScreenPlayer } from "@/components/full-screen-player"
import { Slider } from "@/components/ui/slider"
import { Visualizer } from "@/components/visualizer"

export function Player() {
    const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious, playlist } = usePlayer()
    const audioRef = useRef<HTMLAudioElement>(null)
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)

    useEffect(() => {
        if (audioRef.current) {
            if (isPlaying) {
                const playPromise = audioRef.current.play()
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.error("Playback failed:", error)
                    })
                }
            } else {
                audioRef.current.pause()
            }
        }
    }, [isPlaying, currentTrack])

    // ... (rest of the component)



    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioRef.current) {
            setDuration(audioRef.current.duration)
        }
    }

    const handleSeek = (value: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = value
            setCurrentTime(value)
        }
    }

    if (!currentTrack) return null

    const hasPlaylist = playlist.length > 1

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 mx-auto max-w-[1400px] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 z-50">
                {/* Visualizer Border */}
                <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden pointer-events-none">
                    <Visualizer
                        isPlaying={isPlaying}
                        barCount={100}
                        className="h-full w-full items-end justify-between gap-[1px] opacity-100"
                        color="bg-primary"
                    />
                </div>

                <div className="flex items-center justify-between gap-4">
                    {/* Track Info */}
                    <div className="flex items-center gap-3 w-full md:w-1/3 cursor-pointer overflow-hidden" onClick={() => setIsFullScreen(true)}>
                        {currentTrack.artist?.imageUrl && (
                            <img
                                src={currentTrack.artist.imageUrl}
                                alt={currentTrack.artist?.name || "Artist"}
                                className="h-10 w-10 md:h-12 md:w-12 rounded object-cover flex-shrink-0"
                            />
                        )}
                        <div className="min-w-0 flex-1 overflow-hidden">
                            <div className="relative overflow-hidden whitespace-nowrap">
                                <h4 className={`font-medium text-sm ${currentTrack.title.length > 20 ? "animate-marquee inline-block" : "truncate"}`}>
                                    {currentTrack.title}
                                    {currentTrack.title.length > 20 && <span className="inline-block w-8"></span>}
                                    {currentTrack.title.length > 20 && currentTrack.title}
                                </h4>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                                {currentTrack.artist?.name || "Unknown Artist"}
                            </p>
                        </div>
                    </div>

                    {/* Controls - Hidden on very small screens if needed, or compacted */}
                    <div className="flex flex-col items-center gap-2 md:w-1/3 shrink-0">
                        <div className="flex items-center gap-2 md:gap-4">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hidden sm:inline-flex"
                                onClick={playPrevious}
                                disabled={!hasPlaylist}
                            >
                                <SkipBack className="h-5 w-5" />
                            </Button>
                            <Button
                                size="icon"
                                className="rounded-full h-8 w-8 md:h-10 md:w-10"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    togglePlay()
                                }}
                            >
                                {isPlaying ? (
                                    <Pause className="h-4 w-4 md:h-5 md:w-5" />
                                ) : (
                                    <Play className="h-4 w-4 md:h-5 md:w-5 ml-0.5" />
                                )}
                            </Button>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hidden sm:inline-flex"
                                onClick={playNext}
                                disabled={!hasPlaylist}
                            >
                                <SkipForward className="h-5 w-5" />
                            </Button>
                        </div>
                        <audio
                            key={currentTrack.id}
                            ref={audioRef}
                            src={currentTrack.audioUrl}
                            autoPlay={isPlaying}
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onEnded={() => {
                                // Auto-play next track if available
                                if (hasPlaylist) {
                                    playNext()
                                } else {
                                    setIsPlaying(false)
                                }
                            }}
                        />
                    </div>

                    {/* Volume/Expand - Hidden on mobile */}
                    <div className="hidden md:flex items-center justify-end gap-2 w-1/3">
                        <Volume2 className="h-5 w-5 text-muted-foreground" />
                        <div className="w-24">
                            <Slider
                                value={[volume]}
                                max={1}
                                step={0.01}
                                onValueChange={(val: number[]) => setVolume(val[0])}
                            />
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setIsFullScreen(true)}>
                            <Maximize2 className="h-5 w-5 text-muted-foreground" />
                        </Button>
                    </div>
                </div>
            </div>

            <FullScreenPlayer
                track={currentTrack}
                isPlaying={isPlaying}
                togglePlay={togglePlay}
                isOpen={isFullScreen}
                onClose={() => setIsFullScreen(false)}
                currentTime={currentTime}
                duration={duration}
                onSeek={handleSeek}
                volume={volume}
                onVolumeChange={setVolume}
                audioElement={audioRef.current}
            />
        </>
    )
}
