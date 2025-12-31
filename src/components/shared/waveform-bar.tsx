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
                        "w-0.5 rounded-full transition-all duration-75 origin-bottom bg-current",
                        color,
                        isPlaying ? "animate-music-bar" : undefined
                    )}
                    style={{
                        animationDuration: `${0.6 + ((i * 0.4) % 0.4)}s`,
                        height: '100%',
                        transform: isPlaying ? undefined : `scaleY(${0.1 + ((0.17 * i) % 0.3)})`
                    }}
                />
            ))}
        </div>
    )
}
