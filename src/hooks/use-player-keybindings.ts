"use client"

import { useEffect } from "react"

interface UsePlayerKeybindingsOptions {
    isPlaying: boolean
    isOpen?: boolean
    onPlayPause: () => void
    onSeek: (value: number) => void
    currentTime: number
    duration: number
    onVolumeChange: (value: number) => void
    volume: number
    onMuteToggle: () => void
    playNext?: () => void
    playPrevious?: () => void
}

/**
 * Global keyboard shortcuts for the media player.
 * Only fires when focus is NOT in an input, textarea, or select.
 * 
 * Space           - Play / Pause
 * ArrowRight      - Seek forward 10s
 * ArrowLeft       - Seek backward 10s
 * Shift+ArrowRight - Next track
 * Shift+ArrowLeft  - Previous track
 * ArrowUp         - Volume +5%
 * ArrowDown       - Volume -5%
 * m               - Toggle mute
 */
export function usePlayerKeybindings({
    isPlaying,
    isOpen,
    onPlayPause,
    onSeek,
    currentTime,
    duration,
    onVolumeChange,
    volume,
    onMuteToggle,
    playNext,
    playPrevious,
}: UsePlayerKeybindingsOptions) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if user is focused on input, textarea, select, or a contenteditable
            const target = e.target as HTMLElement
            if (
                target.tagName === "INPUT" ||
                target.tagName === "TEXTAREA" ||
                target.tagName === "SELECT" ||
                target.isContentEditable
            ) {
                return
            }

            switch (e.code) {
                case "Space": {
                    e.preventDefault()
                    onPlayPause()
                    break
                }
                case "ArrowRight": {
                    if (e.shiftKey) {
                        e.preventDefault()
                        playNext?.()
                    } else if (duration > 0) {
                        e.preventDefault()
                        onSeek(Math.min(currentTime + 10, duration))
                    }
                    break
                }
                case "ArrowLeft": {
                    if (e.shiftKey) {
                        e.preventDefault()
                        playPrevious?.()
                    } else if (duration > 0) {
                        e.preventDefault()
                        onSeek(Math.max(currentTime - 10, 0))
                    }
                    break
                }
                case "ArrowUp": {
                    e.preventDefault()
                    onVolumeChange(Math.min(volume + 0.05, 1))
                    break
                }
                case "ArrowDown": {
                    e.preventDefault()
                    onVolumeChange(Math.max(volume - 0.05, 0))
                    break
                }
                case "KeyM": {
                    e.preventDefault()
                    onMuteToggle()
                    break
                }
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [isPlaying, isOpen, onPlayPause, onSeek, currentTime, duration, onVolumeChange, volume, onMuteToggle, playNext, playPrevious])
}
