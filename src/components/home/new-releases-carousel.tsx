"use client"

import React, { useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Swiper as SwiperType } from "swiper"

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
        <div className="relative h-8 w-full overflow-hidden bg-transparent rounded-full mb-8 select-none">
            {/* Static Needle / Highlight - Always center */}
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-0.5 bg-red-500 z-20 -translate-x-1/2 shadow-[0_0_6px_1px_rgba(255,0,0,0.6)]" />

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
                    const opacity = Math.max(0.05, 1 - dist * 0.25)

                    if (dist > 3.5) return null // Show only 3 on each side + center

                    // Dynamic height based on distance from center
                    // We want: Center=High, Farther=Lower. Max height 3px to match needle.
                    // Center (dist=0) -> 3px.
                    // Neighbors -> reduce.
                    const heightValue = Math.max(1, 3 - Math.round(dist))
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
                                    isCurrent ? "bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-neutral-400/80 dark:bg-white/80",
                                    isCurrent ? "w-[2px]" : "w-[1px]" // Make current slightly thicker for visibility at small size
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
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)
    const swiperRef = useRef<SwiperType | null>(null)

    return (
        <div className="space-y-6 w-full">
            <AnalogWheelIndicator key={tracks.length} total={tracks.length} current={currentIndex} />

            <div className="relative">
                {/* Navigation Arrows */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-12 z-20 hidden md:block">
                    <button
                        onClick={() => swiperRef.current?.slidePrev()}
                        className="p-2 text-foreground hover:text-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isBeginning}
                    >
                        <ChevronLeft className="h-8 w-8" />
                    </button>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 -right-12 z-20 hidden md:block">
                    <button
                        onClick={() => swiperRef.current?.slideNext()}
                        className="p-2 text-foreground hover:text-foreground/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isEnd}
                    >
                        <ChevronRight className="h-8 w-8" />
                    </button>
                </div>

                {/* Negative margin to breakout on mobile, but keeping padding for shadows */}
                <div className="-mx-4 px-4 overflow-visible py-4 -my-4 sm:mx-0 sm:px-0 sm:overflow-hidden relative">
                    <Swiper
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper
                            setIsBeginning(swiper.isBeginning)
                            setIsEnd(swiper.isEnd)
                        }}
                        slidesPerView={1.1} // Slightly show next slide to encourage swipe
                        spaceBetween={16}
                        centeredSlides={false}
                        loop={false}
                        className="w-full py-4 !overflow-visible sm:!overflow-hidden"
                        onSlideChange={(swiper) => {
                            setCurrentIndex(swiper.realIndex)
                            setIsBeginning(swiper.isBeginning)
                            setIsEnd(swiper.isEnd)
                        }}
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
        </div>
    )
}
