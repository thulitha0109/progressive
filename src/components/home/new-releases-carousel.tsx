"use client"

import React, { useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { cn } from "@/lib/utils"
// import { ChevronLeft, ChevronRight } from "lucide-react" 

interface Track {
    id: string
    title: string
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    likesCount: number
    isLiked: boolean
    genre?: string | null
    artist: {
        id: string
        name: string
        imageUrl?: string | null
        slug: string
    }
}

// Analog Wheel Indicator Component
function AnalogWheelIndicator({ total, current }: { total: number, current: number }) {
    // We maintain a "visual" index that can go infinite (negative or positive)
    // to support the visual of an infinite tape.
    const [visualIndex, setVisualIndex] = useState(current)
    const prevRef = useRef(current)

    // Sync visual index with current index, handling the shortest path wrapping
    useEffect(() => {
        if (!total) return

        // Calculate the shortest path difference using modular arithmetic
        const prev = prevRef.current
        let diff = (current - prev) % total

        // Adjust for JavaScript's negative modulo behavior and centering
        if (diff < -total / 2) diff += total
        if (diff > total / 2) diff -= total

        if (diff !== 0) {
            setVisualIndex(v => v + diff)
            prevRef.current = current
        }
    }, [current, total])

    const tickWidth = 20
    const visibleTicks = 50 // Reduced to 50 for better performance and DOM size

    // Memoize the visible ticks window to avoid unnecessary recalculations
    const ticks = React.useMemo(() => {
        const startTick = Math.floor(visualIndex) - Math.floor(visibleTicks / 2)
        const endTick = startTick + visibleTicks
        const result = []
        for (let i = startTick; i <= endTick; i++) {
            result.push(i)
        }
        return result
    }, [visualIndex, visibleTicks])

    if (!total) return null

    return (
        <div className="relative h-8 w-full overflow-hidden bg-transparent dark:bg-black/60 rounded-full mb-8 select-none">
            {/* Static Needle / Highlight - Always center */}
            <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-red-500 z-20 -translate-x-1/2 shadow-[0_0_10px_2px_rgba(255,0,0,0.5)]" />

            {/* Moving Strip */}
            <div
                className="absolute top-0 bottom-0 left-1/2 h-full will-change-transform transition-transform duration-500 ease-out"
                style={{
                    // Shift the whole strip so the tick at 'visualIndex' is at the center (which is 0px relative to left:50%)
                    transform: `translateX(calc(-${visualIndex * tickWidth}px - ${tickWidth / 2}px))`
                }}
            >
                {ticks.map((i) => {
                    // Map absolute index 'i' to actual track index 'realIndex'
                    const realIndex = ((i % total) + total) % total
                    const isCurrent = realIndex === current
                    // Calculate distance from visual center for opacity
                    const dist = Math.abs(i - visualIndex)
                    const opacity = Math.max(0.1, 1 - dist * 0.15)

                    if (dist > 3.5) return null // Show only 3 on each side + center

                    // Dynamic height based on distance from center
                    // dist is 0 at center, ~1 at first neighbor, etc.
                    // We want: Center=High, Farther=Lower
                    const heightValue = Math.max(4, 24 - (Math.round(dist) * 6))
                    const heightClass = `h-[${heightValue}px]`

                    return (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 flex justify-center items-center"
                            style={{
                                width: `${tickWidth}px`,
                                left: `${i * tickWidth}px`
                            }}
                        >
                            <div
                                className={cn(
                                    "w-0.5 rounded-full transition-all duration-300",
                                    isCurrent ? "bg-black dark:bg-white shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:shadow-[0_0_8px_rgba(255,255,255,0.8)]" : "bg-black/20 dark:bg-white/40"
                                )}
                                style={{
                                    opacity,
                                    height: `${heightValue}px`
                                }}
                            />
                        </div>
                    )
                })}
            </div>

            {/* Side Fades for depth - adapt to theme */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none" />
        </div>
    )
}

export function NewReleasesCarousel({ tracks }: { tracks: Track[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <div className="space-y-6 w-full overflow-hidden">
            <AnalogWheelIndicator key={tracks.length} total={tracks.length} current={currentIndex} />

            {/* Negative margin to breakout on mobile, but keeping padding for shadows */}
            <div className="-mx-4 px-4 overflow-visible py-4 -my-4 sm:mx-0 sm:px-0 sm:overflow-hidden">
                <Swiper
                    slidesPerView={1.1} // Slightly show next slide to encourage swipe
                    spaceBetween={16}
                    centeredSlides={false}
                    loop={tracks.length > 4}
                    // FreeMode removed to ensure snapping and correct index updates for the indicator
                    className="w-full py-4 !overflow-visible sm:!overflow-hidden"
                    onRealIndexChange={(swiper) => setCurrentIndex(swiper.realIndex)}
                    breakpoints={{
                        640: {
                            slidesPerView: 1.5,
                            spaceBetween: 24,
                        },
                        1024: {
                            slidesPerView: 2.2,
                            spaceBetween: 32,
                        }
                    }}
                >
                    {tracks.map((track) => (
                        <SwiperSlide key={track.id} className="h-full !h-auto">
                            <div className="p-1 h-full"> {/* Padding for potential hover scale/shadow clipping */}
                                <NewReleaseCard track={track} />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    )
}
