"use client"

import { usePlayer } from "@/components/shared/player-context"
import { Button } from "@/components/ui/button"
import { Pause, Play, SkipBack, SkipForward, Volume2, Maximize2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { FullScreenPlayer } from "@/components/shared/full-screen-player"
import { Slider } from "@/components/ui/slider"
import { Visualizer } from "@/components/shared/visualizer"
import { FollowButton } from "@/components/artist/follow-button"

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
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 h-16 flex flex-col justify-center">
                {/* Progress Bar (Top of player) */}
                <div
                    className="absolute top-0 left-0 right-0 h-1 bg-white/10 cursor-pointer group"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        if (audioRef.current) {
                            const newTime = percent * duration
                            audioRef.current.currentTime = newTime
                            setCurrentTime(newTime)
                        }
                    }}
                >
                    <div
                        className="h-full bg-primary group-hover:bg-primary/80 transition-colors relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                        {/* Scrubber Handle */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-1/2" />
                    </div>
                </div>

                <div className="max-w-[1400px] w-full mx-auto px-4 flex items-center justify-between gap-4 h-full">

                    {/* Left: Controls */}
                    <div className="flex items-center gap-4 min-w-[140px]">
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-white h-8 w-8"
                            onClick={playPrevious}
                            disabled={!hasPlaylist}
                        >
                            <SkipBack className="h-4 w-4 fill-current" />
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-white hover:scale-105 transition-transform h-10 w-10"
                            onClick={(e) => {
                                e.stopPropagation()
                                togglePlay()
                            }}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 fill-current" />
                            ) : (
                                <Play className="h-6 w-6 ml-1 fill-current" />
                            )}
                        </Button>
                        <Button
                            size="icon"
                            variant="ghost"
                            className="text-gray-400 hover:text-white h-8 w-8"
                            onClick={playNext}
                            disabled={!hasPlaylist}
                        >
                            <SkipForward className="h-4 w-4 fill-current" />
                        </Button>
                    </div>

                    {/* Center: Track Info & Avatar */}
                    <div className="flex items-center gap-4 flex-1 max-w-2xl px-4 overflow-hidden">
                        {currentTrack.imageUrl || currentTrack.artist?.imageUrl ? (
                            <img
                                src={currentTrack.imageUrl || currentTrack.artist.imageUrl || ""}
                                alt={currentTrack.title}
                                className="h-10 w-10 object-cover bg-neutral-800 flex-shrink-0"
                            />
                        ) : (
                            <div className="h-10 w-10 bg-neutral-800 flex-shrink-0" />
                        )}

                        <div className="flex flex-col overflow-hidden justify-center h-full gap-0.5">
                            <span className="text-xs text-gray-400 truncate hover:underline cursor-pointer">
                                {currentTrack.artist?.name}
                            </span>
                            <span className="text-sm text-white/90 font-medium truncate hover:text-white cursor-pointer" onClick={() => setIsFullScreen(true)}>
                                {currentTrack.title}
                            </span>
                        </div>
                    </div>

                    {/* Right: Actions & Volume */}
                    <div className="flex items-center gap-4 min-w-[200px] justify-end">
                        {/* Follow Button (Icon Only context) */}
                        {currentTrack.artist && currentTrack.artist.id && (
                            <div className="transform scale-90">
                                <FollowButton artistId={currentTrack.artist.id} showText={true} />
                            </div>
                        )}

                        <div className="flex items-center gap-2 group">
                            <Volume2 className="h-4 w-4 text-gray-400 group-hover:text-white" />
                            <div className="w-20">
                                <Slider
                                    value={[volume]}
                                    max={1}
                                    step={0.01}
                                    className="cursor-pointer"
                                    onValueChange={(val: number[]) => setVolume(val[0])}
                                />
                            </div>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white"
                            onClick={() => setIsFullScreen(true)}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <audio
                ref={audioRef}
                src={currentTrack.audioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={playNext}
            />
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
