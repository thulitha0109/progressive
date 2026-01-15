"use client"

import Image from "next/image"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ClientDate } from "@/components/shared/client-date"

interface Item {
    id: string
    title: string
    scheduledFor: Date | string
    kind: "TRACK" | "PODCAST" // Renamed from type to kind for internal logic
    type: string | null // Actual type display string (Warm, Drive, Remix, etc)
    genre?: string | null
    genreRel?: {
        name: string
        parent?: {
            name: string
        }
    } | null
    artist: {
        name: string
        slug: string
        imageUrl?: string | null
    }
    sequence?: number
}

// ... existing helper functions ...

export function UpcomingCarousel({ tracks }: { tracks: Item[] }) {
    return (
        <Swiper
            slidesPerView={1.5}
            spaceBetween={16}
            freeMode={true}
            modules={[FreeMode]}
            className="w-full"
            breakpoints={{
                640: {
                    slidesPerView: 2.5,
                },
                1024: {
                    slidesPerView: 3.5,
                },
                1280: {
                    slidesPerView: 4,
                }
            }}
        >
            {tracks.map((item) => (
                <SwiperSlide key={item.id}>
                    <Link href={item.artist ? `/artists/${item.artist.slug}` : '#'}>
                        <div className="group relative aspect-square overflow-hidden rounded-md bg-muted shadow-lg transition-all hover:shadow-xl isolate ring-1 ring-white/10 ring-inset">
                            {/* Full Image Background */}
                            {item.artist?.imageUrl ? (
                                <Image
                                    src={item.artist.imageUrl}
                                    alt={item.artist.name}
                                    fill
                                    className="object-cover object-top transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    sizes="(max-width: 640px) 40vw, (max-width: 1024px) 30vw, 25vw"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                    <User className="h-20 w-20 text-muted-foreground/50" />
                                </div>
                            )}

                            {/* Top Left Badges: Type & Sequence (Inline) */}
                            <div className="absolute top-2 left-2 z-20 flex flex-row items-center gap-2">
                                {/* Type Badge - Specific Colors */}
                                {item.type && (
                                    <div
                                        className={cn(
                                            "flex items-center gap-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border text-black shadow-sm",
                                            // Default fallback if style override isn't enough or for tracks
                                            !["Warm", "Drive", "Peak"].includes(item.type) && "bg-primary border-primary"
                                        )}
                                        style={{
                                            backgroundColor: item.type === "Warm" ? "#F9D829" :
                                                item.type === "Drive" ? "#F9A01C" :
                                                    item.type === "Peak" ? "#E7250C" : undefined,
                                            borderColor: item.type === "Warm" ? "#F9D829" :
                                                item.type === "Drive" ? "#F9A01C" :
                                                    item.type === "Peak" ? "#E7250C" : undefined,
                                            color: item.type === "Warm" ? "#000" : undefined // Ensure contrast for yellow
                                        }}
                                    >
                                        <span>{item.type}</span>
                                    </div>
                                )}

                                {/* Sequence Badge - FeaturedSection Style */}
                                {item.sequence !== undefined && item.sequence !== null && (
                                    <span className={cn(
                                        "font-medium tracking-widest uppercase text-[10px] sm:text-xs px-2 py-0.5 rounded border shadow-sm backdrop-blur-md",
                                        "border-orange-500/50",
                                        "text-white bg-black/20"
                                    )}>
                                        {String(item.sequence).padStart(3, '0')}
                                    </span>
                                )}
                            </div>

                            {/* Content Overlay - Scrim Gradient (Bottom) */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5 pt-12">
                                <div className="transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs text-white/70 font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            <ClientDate date={item.scheduledFor} options={{ month: 'short', day: 'numeric' }} />
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white line-clamp-1 leading-tight">{item.title}</h3>
                                    <p className="text-sm text-gray-300 font-medium">{item.artist?.name || "Unknown Artist"}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
