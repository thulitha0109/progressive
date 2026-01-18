import { getPodcastBySlug } from "@/server/actions/podcasts"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { PlayButton } from "@/components/shared/play-button"
import { LikeButton } from "@/components/shared/like-button"
import { ShareMenu } from "@/components/shared/share-menu"
import { Calendar, User, Clock, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params
    const podcast = await getPodcastBySlug(slug)

    if (!podcast) {
        return {
            title: 'Podcast Not Found',
        }
    }

    const artistName = podcast.artist?.name || "Unknown Artist"

    return {
        title: `${podcast.title} by ${artistName}`,
        description: podcast.description || `Listen to ${podcast.title} on Progressive.lk`,
        openGraph: {
            images: podcast.imageUrl ? [podcast.imageUrl] : [],
        },
    }
}

export default async function PodcastPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    const podcast = await getPodcastBySlug(slug)

    if (!podcast) {
        notFound()
    }

    // Transform for player
    const playerTrack = {
        id: podcast.id,
        title: podcast.title,
        audioUrl: podcast.audioUrl!,
        imageUrl: podcast.imageUrl,
        artist: {
            id: podcast.artist?.id || "unknown",
            name: podcast.artist?.name || "Unknown Artist",
            imageUrl: podcast.artist?.imageUrl
        },
        kind: "PODCAST" as const
    }

    const artistName = podcast.artist?.name || "Unknown Artist"
    const artistSlug = podcast.artist?.slug || "#"

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero Section */}
            <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh]">
                <div className="absolute inset-0">
                    {podcast.imageUrl ? (
                        <Image
                            src={podcast.imageUrl}
                            alt={podcast.title}
                            fill
                            className="object-cover"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-muted" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="container relative h-full flex flex-col justify-end pb-12 z-10 px-4 md:px-8">
                    <Link
                        href="/podcasts"
                        className="absolute top-8 left-4 md:left-8 inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Podcasts
                    </Link>

                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-3 text-white/80">
                                <span className="px-3 py-1 bg-primary/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-primary/20 text-primary-foreground">
                                    {podcast.type || "Podcast"}
                                </span>
                                {podcast.genre && (
                                    <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider border border-white/20">
                                        {podcast.genre.name}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2">
                                {podcast.title}
                            </h1>

                            <div className="flex flex-wrap items-center gap-6 text-white/90">
                                <Link href={`/artists/${artistSlug}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                                    {podcast.artist?.imageUrl ? (
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                            <Image
                                                src={podcast.artist.imageUrl}
                                                alt={artistName}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <User className="w-8 h-8" />
                                    )}
                                    <span className="text-lg font-medium">{artistName}</span>
                                </Link>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {format(new Date(podcast.scheduledFor), 'MMMM d, yyyy')}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="h-14 flex items-center">
                                <PlayButton
                                    track={playerTrack}
                                    variant="default"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="bg-background/10 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-background/20 transition-colors">
                                    <LikeButton
                                        trackId={podcast.id}
                                        initialLikes={podcast._count.likedBy}
                                        initialIsLiked={false} // Default to false if not fetched, or fetch it
                                        type="PODCAST"
                                    />
                                </div>
                                <div className="bg-background/10 backdrop-blur-md p-2 rounded-full border border-white/10 text-white hover:bg-background/20 transition-colors">
                                    <ShareMenu
                                        url={`/podcasts/${podcast.slug}`}
                                        title={podcast.title}
                                        text={`Check out ${podcast.title} by ${artistName}`}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="container py-12 max-w-4xl px-4 md:px-8">
                <div className="prose prose-invert max-w-none">
                    <div className="flex flex-col gap-8">
                        <div>
                            <h3 className="text-xl font-semibold mb-4 text-foreground">About this Episode</h3>
                            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed text-lg">
                                {podcast.description}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
