"use client"

import React, { useState, useEffect, useRef } from "react"
import { Swiper, SwiperSlide } from "swiper/react"
import "swiper/css"
import "swiper/css/free-mode"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Swiper as SwiperType } from "swiper"

interface Podcast {
    id: string
    title: string
    slug: string // Added slug
    audioUrl: string
    imageUrl?: string | null
    scheduledFor: Date
    type: string | null
    likesCount: number
    isLiked: boolean
    genre?: string | null
    kind?: "TRACK" | "PODCAST"
    artist: {
        id: string
        name: string
        imageUrl?: string | null
        slug: string
    }
}

// Analog Wheel Indicator Component (Reused)
function AnalogWheelIndicator({ total, current }: { total: number, current: number }) {
    const [visualIndex, setVisualIndex] = useState(current)
    const prevRef = useRef(current)

    useEffect(() => {
        if (!total) return
        const prev = prevRef.current
        let diff = (current - prev) % total
        if (diff < -total / 2) diff += total
        if (diff > total / 2) diff -= total

        if (diff !== 0) {
            setVisualIndex(v => v + diff)
            prevRef.current = current
        }
    }, [current, total])

    const tickWidth = 20
    const visibleTicks = 50

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
            <div className="absolute left-1/2 top-1/2 -translate-y-1/2 h-[3px] w-0.5 bg-red-500 z-20 -translate-x-1/2 shadow-[0_0_6px_1px_rgba(255,0,0,0.6)]" />
            <div
                className="absolute top-0 bottom-0 left-1/2 h-full will-change-transform transition-transform duration-500 ease-out"
                style={{
                    transform: `translateX(calc(-${visualIndex * tickWidth}px - ${tickWidth / 2}px))`
                }}
            >
                {ticks.map((i) => {
                    const realIndex = ((i % total) + total) % total
                    const isCurrent = realIndex === current
                    const dist = Math.abs(i - visualIndex)
                    const opacity = Math.max(0.05, 1 - dist * 0.25)
                    if (dist > 3.5) return null
                    const heightValue = Math.max(1, 3 - Math.round(dist))
                    return (
                        <div
                            key={i}
                            className="absolute top-0 bottom-0 flex justify-center items-center"
                            style={{ width: `${tickWidth}px`, left: `${i * tickWidth}px` }}
                        >
                            <div
                                className={cn(
                                    "w-0.5 rounded-full transition-all duration-300",
                                    isCurrent ? "bg-foreground shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "bg-neutral-400/80 dark:bg-white/80",
                                    isCurrent ? "w-[2px]" : "w-[1px]"
                                )}
                                style={{ opacity, height: `${heightValue}px` }}
                            />
                        </div>
                    )
                })}
            </div>
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background via-background/90 to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background via-background/90 to-transparent z-10 pointer-events-none" />
        </div>
    )
}

export function NewPodcastsCarousel({ podcasts }: { podcasts: Podcast[] }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [isBeginning, setIsBeginning] = useState(true)
    const [isEnd, setIsEnd] = useState(false)
    const swiperRef = useRef<SwiperType | null>(null)

    return (
        <div className="space-y-6 w-full">
            <AnalogWheelIndicator key={podcasts.length} total={podcasts.length} current={currentIndex} />

            <div className="relative">
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

                <div className="relative px-0.5 sm:px-0 overflow-hidden">
                    <Swiper
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper
                            setIsBeginning(swiper.isBeginning)
                            setIsEnd(swiper.isEnd)
                        }}
                        slidesPerView={1.1}
                        spaceBetween={16}
                        centeredSlides={false}
                        loop={false}
                        className="w-full py-4"
                        onSlideChange={(swiper) => {
                            setCurrentIndex(swiper.realIndex)
                            setIsBeginning(swiper.isBeginning)
                            setIsEnd(swiper.isEnd)
                        }}
                        breakpoints={{
                            640: { slidesPerView: 1.5, spaceBetween: 24 },
                            1024: { slidesPerView: 2.2, spaceBetween: 32 }
                        }}
                    >
                        {podcasts.map((podcast) => (
                            <SwiperSlide key={podcast.id} className="h-full !h-auto">
                                <div className="h-full">
                                    <NewPodcastCard podcast={podcast} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </div>
    )
}
