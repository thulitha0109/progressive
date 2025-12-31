"use client"

import Link from "next/link"
import { User } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Navigation, A11y } from "swiper/modules"

// Import Swiper styles
import "swiper/css"
import "swiper/css/navigation"

interface Artist {
    id: string
    name: string
    imageUrl: string | null
}

interface ArtistCarouselProps {
    artists: Artist[]
}

export function ArtistCarousel({ artists }: ArtistCarouselProps) {
    if (artists.length === 0) {
        return null
    }

    return (
        <>
            {/* Mobile & Tablet: Swiper Carousel (No controls) */}
            <div className="lg:hidden">
                <Swiper
                    modules={[A11y]}
                    spaceBetween={24}
                    slidesPerView={1}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 24,
                        },
                        768: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                    }}
                    className="artist-carousel-mobile"
                >
                    {artists.map((artist) => (
                        <SwiperSlide key={artist.id}>
                            <Link href={`/artists/${artist.id}`} className="group text-center block">
                                <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-md border-2 border-transparent group-hover:border-primary transition-colors">
                                    {artist.imageUrl ? (
                                        <img
                                            src={artist.imageUrl}
                                            alt={artist.name}
                                            className="h-full w-full object-cover object-top"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="h-full w-full bg-muted flex items-center justify-center">
                                            <User className="h-12 w-12 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                                <h3 className="font-medium group-hover:text-primary transition-colors">
                                    {artist.name}
                                </h3>
                            </Link>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

            {/* Desktop: Grid if 6 or fewer, Carousel with arrows if more than 6 */}
            {artists.length <= 6 ? (
                <div className="hidden lg:grid gap-6 grid-cols-6">
                    {artists.map((artist) => (
                        <Link key={artist.id} href={`/artists/${artist.id}`} className="group text-center">
                            <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-md border-2 border-transparent group-hover:border-primary transition-colors">
                                {artist.imageUrl ? (
                                    <img
                                        src={artist.imageUrl}
                                        alt={artist.name}
                                        className="h-full w-full object-cover object-top"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="h-full w-full bg-muted flex items-center justify-center">
                                        <User className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                )}
                            </div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">
                                {artist.name}
                            </h3>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="hidden lg:block">
                    <Swiper
                        modules={[Navigation, A11y]}
                        spaceBetween={24}
                        slidesPerView={6}
                        navigation
                        className="artist-carousel-desktop"
                    >
                        {artists.map((artist) => (
                            <SwiperSlide key={artist.id}>
                                <Link href={`/artists/${artist.id}`} className="group text-center block">
                                    <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-md border-2 border-transparent group-hover:border-primary transition-colors">
                                        {artist.imageUrl ? (
                                            <img
                                                src={artist.imageUrl}
                                                alt={artist.name}
                                                className="h-full w-full object-cover object-top"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="h-full w-full bg-muted flex items-center justify-center">
                                                <User className="h-12 w-12 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium group-hover:text-primary transition-colors">
                                        {artist.name}
                                    </h3>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
        </>
    )
}
