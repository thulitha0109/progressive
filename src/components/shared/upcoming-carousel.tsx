"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface Track {
    id: string
    title: string
    scheduledFor: Date
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
}

const GENRE_BORDERS: Record<string, string> = {
    "Progressive": "border-blue-500/50 hover:border-blue-500",
    "Melodic": "border-cyan-500/50 hover:border-cyan-500",
    "Techno": "border-purple-500/50 hover:border-purple-500",
    "Peak Time": "border-fuchsia-500/50 hover:border-fuchsia-500",
    "House": "border-orange-500/50 hover:border-orange-500",
    "Deep House": "border-amber-500/50 hover:border-amber-500",
    "Trance": "border-pink-500/50 hover:border-pink-500",
    "Electronica": "border-emerald-500/50 hover:border-emerald-500",
    "Organic": "border-green-500/50 hover:border-green-500",
    "Drum & Bass": "border-yellow-500/50 hover:border-yellow-500",
    "Liquid": "border-lime-500/50 hover:border-lime-500",
    "Ambient": "border-teal-500/50 hover:border-teal-500",
    "Chillout": "border-indigo-500/50 hover:border-indigo-500",
}

function getGenreBorderColor(genre: string) {
    const key = Object.keys(GENRE_BORDERS).find(k => genre.includes(k))
    return key ? GENRE_BORDERS[key] : "border-white/10 hover:border-white/30"
}

export function UpcomingCarousel({ tracks }: { tracks: Track[] }) {
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
            {tracks.map((track) => (
                <SwiperSlide key={track.id}>
                    <Link href={`/artists/${track.artist.slug}`}>
                        <div className="group relative aspect-square overflow-hidden rounded-md bg-muted shadow-lg transition-all hover:shadow-xl isolate ring-1 ring-white/10 ring-inset">
                            {/* Full Image Background */}
                            {track.artist.imageUrl ? (
                                <img
                                    src={track.artist.imageUrl}
                                    alt={track.artist.name}
                                    className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
                                    <User className="h-20 w-20 text-muted-foreground/50" />
                                </div>
                            )}

                            {/* Content Overlay - Scrim Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                                <div className="transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Badge variant="outline" className="bg-black/40 border-white/20 text-white backdrop-blur-sm">
                                            Upcoming
                                        </Badge>
                                        <span className="text-xs text-white/70 font-medium flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(track.scheduledFor).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-white line-clamp-1 leading-tight">{track.title}</h3>
                                    <p className="text-sm text-gray-300 font-medium">{track.artist.name}</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
