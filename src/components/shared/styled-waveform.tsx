"use client"

import { cn } from "@/lib/utils"

interface StyledWaveformProps {
    isPlaying: boolean
    className?: string
    color?: string
}

// Symmetric shading: Dark - Light - Dark (Logo colors)
const SHADING_COLORS = [
    "#062169", // Darkest
    "#85a3f9", // Lightest (Middle)
    "#062169"  // Darkest
]

export function StyledWaveform({ isPlaying, className, color }: StyledWaveformProps) {
    return (
        <div className={cn(
            "relative h-3 flex items-center justify-center gap-1.5 px-2 py-0.5",
            className
        )}>
            {/* 3 Animated Dots - Symmetric Shading */}
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 h-1 rounded-full transition-all duration-500 ease-in-out",
                        isPlaying && "animate-dot-pulse"
                    )}
                    style={{
                        backgroundColor: color || SHADING_COLORS[i],
                        boxShadow: `0 0 4px ${color || SHADING_COLORS[i]}44`,
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
        </div>
    )
}
