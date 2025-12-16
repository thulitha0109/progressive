"use client"

import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface WaveformBarProps {
    isPlaying: boolean
    color?: string
    count?: number
    height?: string
}

export function WaveformBar({
    isPlaying,
    color = "bg-primary",
    count = 12,
    height = "h-8"
}: WaveformBarProps) {
    return (
        <div className={cn("flex gap-0.5 items-end", height)}>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-t-sm transition-all duration-75",
                        color,
                        isPlaying ? "animate-music-bar" : undefined
                    )}
                    style={{
                        // Deterministic pseudo-random values to prevent hydration mismatch and remove need for 'mounted' state
                        animationDuration: `${0.6 + ((i * 0.4) % 0.4)}s`,
                        height: isPlaying ? '100%' : `${10 + ((i * 17) % 30)}%`
                    }}
                />
            ))}
        </div>
    )
}
