"use client"

import { Swiper, SwiperSlide } from "swiper/react"
import { FreeMode } from "swiper/modules"
import "swiper/css"
import "swiper/css/free-mode"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User } from "lucide-react"

interface Track {
    id: string
    title: string
    scheduledFor: Date
    artist: {
        name: string
        slug: string
        imageUrl?: string | null
    }
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
                        <Card className="overflow-hidden border-none bg-secondary/20 hover:bg-secondary/30 transition-colors h-full">
                            <div className="aspect-square bg-muted relative flex items-center justify-center">
                                {track.artist.imageUrl ? (
                                    <img
                                        src={track.artist.imageUrl}
                                        alt={track.artist.name}
                                        className="h-full w-full object-cover opacity-50"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(track.scheduledFor).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <CardContent className="p-4">
                                <h3 className="font-semibold truncate">{track.title}</h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {track.artist.name}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                </SwiperSlide>
            ))}
        </Swiper>
    )
}
