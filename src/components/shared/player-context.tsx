"use client"

import React, { createContext, useContext, useState } from "react"

interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    artist: {
        id?: string
        name: string
        imageUrl?: string | null
    }
}

interface PlayerContextType {
    currentTrack: Track | null
    isPlaying: boolean
    playlist: Track[]
    currentIndex: number
    playTrack: (track: Track, newPlaylist?: Track[]) => void
    togglePlay: () => void
    setIsPlaying: (isPlaying: boolean) => void
    playNext: () => void
    playPrevious: () => void
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export function PlayerProvider({ children }: { children: React.ReactNode }) {
    const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [playlist, setPlaylist] = useState<Track[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)

    const playTrack = (track: Track, newPlaylist?: Track[]) => {
        if (newPlaylist) {
            setPlaylist(newPlaylist)
            const index = newPlaylist.findIndex(t => t.id === track.id)
            setCurrentIndex(index !== -1 ? index : 0)
        } else {
            // If no playlist provided, add to existing or create new
            const existingIndex = playlist.findIndex(t => t.id === track.id)
            if (existingIndex !== -1) {
                setCurrentIndex(existingIndex)
            } else {
                setPlaylist(prev => [...prev, track])
                setCurrentIndex(playlist.length)
            }
        }
        setCurrentTrack(track)
        setIsPlaying(true)
    }

    const togglePlay = () => {
        if (currentTrack) {
            setIsPlaying(!isPlaying)
        }
    }

    const playNext = () => {
        if (playlist.length === 0) return

        const nextIndex = (currentIndex + 1) % playlist.length
        setCurrentIndex(nextIndex)
        setCurrentTrack(playlist[nextIndex])
        setIsPlaying(true)
    }

    const playPrevious = () => {
        if (playlist.length === 0) return

        const prevIndex = currentIndex === 0 ? playlist.length - 1 : currentIndex - 1
        setCurrentIndex(prevIndex)
        setCurrentTrack(playlist[prevIndex])
        setIsPlaying(true)
    }

    return (
        <PlayerContext.Provider
            value={{
                currentTrack,
                isPlaying,
                playlist,
                currentIndex,
                playTrack,
                togglePlay,
                setIsPlaying,
                playNext,
                playPrevious
            }}
        >
            {children}
        </PlayerContext.Provider>
    )
}

export function usePlayer() {
    const context = useContext(PlayerContext)
    if (context === undefined) {
        throw new Error("usePlayer must be used within a PlayerProvider")
    }
    return context
}
