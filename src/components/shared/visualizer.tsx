"use client"

import { cn } from "@/lib/utils"

interface VisualizerProps {
    isPlaying: boolean
    className?: string
    barCount?: number
    color?: string
}

export function Visualizer({ isPlaying, className, barCount = 20, color = "bg-primary" }: VisualizerProps) {
    return (
        <div className={cn("flex items-end justify-center gap-[2px]", className)}>
            {Array.from({ length: barCount }).map((_, i) => (
                <div
                    key={i}
                    className={cn(
                        "w-1 rounded-t-sm transition-all duration-300",
                        color,
                        isPlaying ? "animate-music-bar" : "h-1"
                    )}
                    style={{
                        height: isPlaying ? undefined : "4px",
                        // Deterministic pseudo-random values to prevent hydration mismatch
                        animationDelay: `${((i * 0.3) % 0.5)}s`,
                        animationDuration: `${0.5 + ((i * 0.7) % 0.5)}s`
                    }}
                />
            ))}
        </div>
    )
}
