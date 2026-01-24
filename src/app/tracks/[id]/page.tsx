import { getTrack, getTracks } from "@/server/actions/tracks"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { PlayButton } from "@/components/shared/play-button"
import { Calendar, User, ArrowLeft, ArrowRight } from "lucide-react"
import { format } from "date-fns"
import { Metadata } from "next"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { cn } from "@/lib/utils"
import { TrackActionBar } from "@/components/shared/track-action-bar"
import { Prisma } from "@prisma/client"

type TrackWithDetails = Prisma.TrackGetPayload<{
    include: {
        artist: true,
        genreRel: true,
        _count: { select: { likedBy: true } }
    }
}> & {
    likesCount: number
    isLiked: boolean
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const { id } = await params
    const track = await getTrack(id)

    if (!track) {
        return {
            title: 'Track Not Found',
        }
    }

    const artistName = track.artist?.name || "Unknown Artist"

    return {
        title: `${track.title} by ${artistName}`,
        description: `Listen to ${track.title} on Progressive.lk`,
        openGraph: {
            images: track.imageUrl ? [track.imageUrl] : [],
        },
    }
}

export default async function TrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const track = await getTrack(id)

    if (!track) {
        notFound()
    }

    // Fetch related tracks (same genre, exclude current)
    const { tracks: relatedTracksRaw } = await getTracks(1, 4, track.genreId || "all", 'published')
    const relatedTracks = (relatedTracksRaw as TrackWithDetails[]).filter((t) => t.id !== track.id).slice(0, 4)

    // Transform for player
    const playerTrack = {
        id: track.id,
        title: track.title,
        audioUrl: track.audioUrl,
        imageUrl: track.imageUrl,
        artist: {
            id: track.artist?.id || "unknown",
            name: track.artist?.name || "Unknown Artist",
            imageUrl: track.artist?.imageUrl
        },
        kind: "TRACK" as const,
        likesCount: track._count?.likedBy || 0,
        isLiked: false // TODO: Fetch actual user like status if available server-side
    }

    const artistName = track.artist?.name || "Unknown Artist"
    const artistSlug = track.artist?.slug || "#"

    // Simple genre coloring
    const GENRE_BORDERS: Record<string, string> = {
        "Progressive": "border-blue-500 text-blue-500 bg-blue-500/10",
        "Melodic": "border-cyan-500 text-cyan-500 bg-cyan-500/10",
        "Techno": "border-purple-500 text-purple-500 bg-purple-500/10",
        "Peak Time": "border-fuchsia-500 text-fuchsia-500 bg-fuchsia-500/10",
        "House": "border-orange-500 text-orange-500 bg-orange-500/10",
        "Deep House": "border-amber-500 text-amber-500 bg-amber-500/10",
        "Trance": "border-pink-500 text-pink-500 bg-pink-500/10",
        "Electronica": "border-emerald-500 text-emerald-500 bg-emerald-500/10",
        "Organic": "border-green-500 text-green-500 bg-green-500/10",
        "Drum & Bass": "border-yellow-500 text-yellow-500 bg-yellow-500/10",
        "Liquid": "border-lime-500 text-lime-500 bg-lime-500/10",
        "Ambient": "border-teal-500 text-teal-500 bg-teal-500/10",
        "Chillout": "border-indigo-500 text-indigo-500 bg-indigo-500/10",
    }

    function getGenreStyle(genre: string) {
        const key = Object.keys(GENRE_BORDERS).find(k => genre.includes(k))
        return key ? GENRE_BORDERS[key] : "border-white/20 text-white/80 bg-white/10"
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh]">
                <div className="absolute inset-0">
                    {track.imageUrl ? (
                        <Image
                            src={track.imageUrl}
                            alt={track.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 bg-black/30" />

                    {/* Centered Play Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pb-24 md:pb-0">
                        <div className="pointer-events-auto">
                            <PlayButton
                                track={playerTrack}
                                variant="glass"
                                className="h-20 w-20 md:h-24 md:w-24"
                            />
                        </div>
                    </div>
                </div>

                <div className="container relative h-full flex flex-col justify-end pb-12 z-10 px-4 md:px-6">
                    <Link
                        href="/tracks"
                        className="absolute top-8 left-4 md:left-6 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Tracks
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex flex-wrap items-center gap-3 text-white/80">
                                {/* Type Badge */}
                                {track.type && (
                                    <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border text-white bg-primary border-primary">
                                        {track.type}
                                    </span>
                                )}

                                {/* Genre Badge */}
                                {track.genreRel && (
                                    <span className={cn(
                                        "font-bold text-xs px-3 py-1 rounded-md border backdrop-blur-md",
                                        getGenreStyle(track.genreRel.name || ""),
                                        "text-white/90 bg-white/5"
                                    )}>
                                        {track.genreRel.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2">
                                {track.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                <Link href={`/artists/${artistSlug}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                    {track.artist?.imageUrl ? (
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                            <Image
                                                src={track.artist.imageUrl}
                                                alt={artistName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                    )}
                                    <span className="text-lg font-medium">{artistName}</span>
                                </Link>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(track.scheduledFor), 'MMM d, yyyy')}
                                </div>
                            </div>
                        </div>

                        <TrackActionBar
                            trackId={track.id}
                            trackTitle={track.title}
                            artistName={artistName}
                            initialLikes={track._count?.likedBy || 0}
                            initialIsLiked={false}
                        />
                    </div>
                </div>
            </div>

            {/* Related Tracks Section */}
            {relatedTracks.length > 0 && (
                <div className="container py-12 px-4 md:px-6 border-t border-border/40">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold tracking-tight">Related Tracks</h2>
                        <Link href={`/?genre=${track.genreId || 'all'}`} className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors group">
                            <span className="sr-only">View All</span>
                            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {relatedTracks.map((related) => (
                            <NewReleaseCard
                                key={related.id}
                                track={{
                                    ...related,
                                    artist: {
                                        id: related.artist?.id || "unknown",
                                        name: related.artist?.name || "Unknown Artist",
                                        imageUrl: related.artist?.imageUrl
                                    },
                                    kind: "TRACK",
                                    type: related.type || "Original",
                                    genre: related.genreRel?.name || null,
                                    likesCount: related.likesCount || 0,
                                    isLiked: related.isLiked || false,
                                    slug: related.id
                                }}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
