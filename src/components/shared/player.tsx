"use client"

import { usePlayer } from "@/components/shared/player-context"
import { Button } from "@/components/ui/button"
import { Pause, Play, Maximize2 } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { FullScreenPlayer } from "@/components/shared/full-screen-player"
import { AddToPlaylistButton } from "@/components/shared/add-to-playlist-button"
import { LikeButton } from "@/components/shared/like-button"
import { FollowButton } from "@/components/artist/follow-button"

export function Player() {
    const { currentTrack, isPlaying, togglePlay, setIsPlaying, playNext, playPrevious, playlist } = usePlayer()
    // Use state callback ref to ensure re-render when audio element is available
    const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
    // We still need a ref for internal access if we want to avoid stale state in closures,
    // but here we can just use the state variable for most things, or keep a synced ref.
    // Simpler: Just use the state `audioElement` everywhere instead of `audioRef.current`.
    const [isFullScreen, setIsFullScreen] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)

    useEffect(() => {
        if (audioElement) {
            if (isPlaying) {
                const playPromise = audioElement.play()
                if (playPromise !== undefined) {
                    playPromise.catch((error) => {
                        console.error("Playback failed:", error)
                    })
                }
            } else {
                audioElement.pause()
            }
        }
    }, [isPlaying, currentTrack, audioElement])

    // ... (rest of the component)



    // Removed redundant useEffect setting setAudioElement(audioRef.current)
    useEffect(() => {
        if (audioElement) {
            audioElement.volume = volume
        }
    }, [volume, audioElement])

    const handleTimeUpdate = () => {
        if (audioElement) {
            setCurrentTime(audioElement.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (audioElement) {
            setDuration(audioElement.duration)
        }
    }

    const handleSeek = (value: number) => {
        if (audioElement) {
            audioElement.currentTime = value
            setCurrentTime(value)
        }
    }

    useEffect(() => {
        if (typeof navigator !== 'undefined' && "mediaSession" in navigator && currentTrack) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: currentTrack.title,
                artist: currentTrack.artist?.name || "Progressive.lk",
                album: "Progressive.lk",
                artwork: [
                    { src: currentTrack.imageUrl || currentTrack.artist?.imageUrl || "/site-icon.jpg", sizes: "512x512", type: "image/jpeg" },
                ]
            });

            navigator.mediaSession.setActionHandler('play', () => {
                setIsPlaying(true)
            });
            navigator.mediaSession.setActionHandler('pause', () => {
                setIsPlaying(false)
            });
            navigator.mediaSession.setActionHandler('previoustrack', () => {
                if (playlist.length > 1) playPrevious()
            });
            navigator.mediaSession.setActionHandler('nexttrack', () => {
                if (playlist.length > 1) playNext()
            });
        }
    }, [currentTrack, setIsPlaying, playPrevious, playNext, playlist.length])

    if (!currentTrack) return null

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#111111] border-t border-white/10 h-auto min-h-20 pb-[env(safe-area-inset-bottom)] flex flex-col justify-center shadow-2xl">

                <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between h-full py-0 relative">

                    {/* Left Section: Art | Play | Info */}
                    <div className="flex items-center gap-0 flex-1 overflow-hidden z-20 h-full">
                        {/* Album Art - Full Left Cover */}
                        <div className="h-20 w-20 shrink-0 relative overflow-hidden mr-4">
                            {currentTrack.imageUrl || currentTrack.artist?.imageUrl ? (
                                <Image
                                    src={currentTrack.imageUrl || currentTrack.artist.imageUrl || ""}
                                    alt={currentTrack.title}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            ) : (
                                <div className="h-full w-full bg-neutral-800" />
                            )}
                        </div>

                        {/* Play Button - Large Circle */}
                        <div
                            className="cursor-pointer text-white hover:text-white transition-all hover:scale-105 active:scale-95 shrink-0 bg-white/10 hover:bg-white/20 rounded-full h-12 w-12 flex items-center justify-center mr-4"
                            onClick={(e) => {
                                e.stopPropagation()
                                togglePlay()
                            }}
                        >
                            {isPlaying ? (
                                <Pause className="h-6 w-6 fill-current" />
                            ) : (
                                <Play className="h-6 w-6 fill-current ml-1" />
                            )}
                        </div>

                        {/* Track Info */}
                        <div className="flex flex-col justify-center min-w-0 pr-4">
                            <div className="relative overflow-hidden w-full">
                                <span className="text-sm text-white font-bold truncate hover:underline cursor-pointer block leading-tight uppercase tracking-wider">
                                    {currentTrack.title}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] sm:text-xs text-gray-400 truncate hover:text-white cursor-pointer block leading-tight uppercase font-medium tracking-wide">
                                    {currentTrack.artist?.name}
                                </span>
                                {/* Follow Icon Next to Artist */}
                                {currentTrack.artist && currentTrack.artist.id && (
                                    <FollowButton
                                        artistId={currentTrack.artist.id}
                                        showText={false}
                                        checkStatus={true}
                                        className="h-4 w-4 text-gray-400 hover:text-white p-0"
                                    />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right: Actions & Volume */}
                    <div className="flex items-center gap-3 sm:gap-5 min-w-fit justify-end shrink-0 pl-2 z-20 pr-4">
                        {/* Like Button */}
                        <div className="transform scale-100 text-gray-400 hover:text-red-500">
                            <LikeButton
                                trackId={currentTrack.id}
                                type={currentTrack.kind || 'TRACK'}
                                initialLikes={currentTrack.likesCount || 0}
                                initialIsLiked={currentTrack.isLiked || false}
                                countClassName="hidden sm:inline"
                            />
                        </div>

                        {/* Add to Playlist */}
                        <div className="hidden sm:block text-gray-400 hover:text-white">
                            <AddToPlaylistButton trackId={currentTrack.id} />
                        </div>



                        {/* Expand Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-white p-0 h-auto w-auto"
                            onClick={() => setIsFullScreen(true)}
                        >
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Progress Bar (Bottom of player - Thick line) */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 cursor-pointer group hover:h-[5px] transition-all z-10"
                    onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect()
                        const percent = (e.clientX - rect.left) / rect.width
                        if (audioElement) {
                            const newTime = percent * duration
                            audioElement.currentTime = newTime
                            setCurrentTime(newTime)
                        }
                    }}
                >
                    <div
                        className="h-full bg-white relative"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                    >
                    </div>
                </div>
            </div>

            <audio
                ref={setAudioElement}
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
                audioElement={audioElement}
                playNext={playNext}
                playPrevious={playPrevious}
            />
        </>
    )
}
