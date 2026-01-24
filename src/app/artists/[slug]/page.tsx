import { getArtistBySlug } from "@/server/actions/artists"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/artist/follow-button"
import { User, AudioLines } from "lucide-react"
import { notFound } from "next/navigation"
import { Prisma } from "@prisma/client"
import { UpcomingCarousel } from "@/components/shared/upcoming-carousel"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"

type ArtistWithRelations = Prisma.ArtistGetPayload<{
    include: {
        tracks: true
        podcasts: true
        _count: {
            select: { followers: true, tracks: true, podcasts: true }
        }
    }
}>

export default async function ArtistPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const artist = await getArtistBySlug(slug)

    if (!artist) {
        notFound()
    }

    // Transform data for UpcomingCarousel
    const upcomingTracks = artist.tracks
        .filter(track => !track.isReleased)
        .map(track => ({
            id: track.id,
            title: track.title,
            scheduledFor: track.scheduledFor,
            kind: "TRACK" as const,
            type: track.type || null,
            label: track.label || null,
            timeZone: track.timeZone,
            genre: track.genre || null,
            artist: {
                name: artist.name,
                slug: artist.slug,
                imageUrl: artist.imageUrl
            }
        }))

    // Transform data for NewReleaseCard
    const releasedTracks = artist.tracks
        .filter(track => track.isReleased)
        .map(track => ({
            id: track.id,
            title: track.title,
            slug: track.id, // Using ID as slug fallback if needed, or track should have slug logic from backend
            audioUrl: track.audioUrl,
            imageUrl: track.imageUrl,
            scheduledFor: track.scheduledFor,
            genre: track.genre,
            type: track.type || null,
            likesCount: track.likesCount,
            isLiked: track.isLiked,
            kind: "TRACK" as const,
            artist: {
                id: artist.id,
                name: artist.name,
                imageUrl: artist.imageUrl,
                slug: artist.slug
            }
        }))

    return (
        <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
            {/* Hero / Header */}
            <div className="relative h-[300px] md:h-[350px] w-full overflow-hidden bg-muted">
                {artist.imageUrl && (
                    <div className="absolute inset-0">
                        <Image
                            src={artist.imageUrl}
                            alt={artist.name}
                            fill
                            className="object-cover object-top opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                )}
            </div>

            <div className="px-4 md:px-6 relative z-10 -mt-32 md:-mt-40 mb-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
                    <div className="relative h-40 w-40 md:h-52 md:w-52 overflow-hidden rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-2xl shrink-0">
                        {artist.imageUrl ? (
                            <Image
                                src={artist.imageUrl}
                                alt={artist.name}
                                fill
                                className="object-cover object-top"
                            />
                        ) : (
                            <User className="h-20 w-20 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 mb-2 md:mb-6 space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight break-words">{artist.name}</h1>
                            <div className="flex flex-wrap items-center gap-6 mt-4">
                                <div className="flex items-center gap-4 text-muted-foreground">
                                    <div className="flex items-center gap-2" title="Followers">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-bold">{(artist as unknown as ArtistWithRelations)._count?.followers || 0}</span>
                                    </div>
                                    <div className="flex items-center gap-2" title="Total Tracks">
                                        <AudioLines className="h-4 w-4" />
                                        <span className="text-sm font-bold">{((artist as unknown as ArtistWithRelations)._count?.tracks || 0) + ((artist as unknown as ArtistWithRelations)._count?.podcasts || 0)}</span>
                                    </div>
                                </div>
                                <FollowButton artistId={artist.id} initialIsFollowing={artist.isFollowing} />
                            </div>
                        </div>

                        {artist.socialLinks && (
                            <div className="flex flex-wrap gap-4">
                                {(() => {
                                    const links = artist.socialLinks as { instagram?: string; youtube?: string; mixcloud?: string; soundcloud?: string; facebook?: string; spotify?: string; tiktok?: string } || {}
                                    return (
                                        <>
                                            {links.instagram && (
                                                <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/instagram.svg" alt="Instagram" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.youtube && (
                                                <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/youtube.svg" alt="YouTube" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.mixcloud && (
                                                <a href={links.mixcloud} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/mixcloud.svg" alt="Mixcloud" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.soundcloud && (
                                                <a href={links.soundcloud} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/soundcloud.svg" alt="SoundCloud" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.facebook && (
                                                <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/fb.svg" alt="Facebook" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.spotify && (
                                                <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/spotify.svg" alt="Spotify" className="h-6 w-6" />
                                                </a>
                                            )}
                                            {links.tiktok && (
                                                <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity p-1 bg-background/50 backdrop-blur rounded-full">
                                                    <img src="/images/ICONS/tiktok.svg" alt="TikTok" className="h-6 w-6" />
                                                </a>
                                            )}
                                        </>
                                    )
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="px-4 md:px-6 py-8 grid gap-12 lg:grid-cols-[2fr_1fr]">
                {/* Tracks & Content */}
                <div className="space-y-12">
                    {/* Upcoming Tracks */}
                    {upcomingTracks.length > 0 && (
                        <div className="animate-slide-up-fade" style={{ animationDelay: "0.05s" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Upcoming Releases</h2>
                                <span className="text-sm text-muted-foreground">{upcomingTracks.length} tracks</span>
                            </div>
                            <div className="w-full">
                                <UpcomingCarousel tracks={upcomingTracks} />
                            </div>
                        </div>
                    )}

                    {/* Recent Podcasts */}
                    {artist.podcasts && artist.podcasts.length > 0 && (
                        <div className="animate-slide-up-fade" style={{ animationDelay: "0.15s" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Recent Podcasts</h2>
                                <span className="text-sm text-muted-foreground">{artist.podcasts.length} podcasts</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {artist.podcasts.map((podcast) => (
                                    <NewPodcastCard key={podcast.id} podcast={podcast} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Released Tracks */}
                    <div className="animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Released Tracks</h2>
                            <span className="text-sm text-muted-foreground">{releasedTracks.length} tracks</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {releasedTracks.map((track) => (
                                <NewReleaseCard key={track.id} track={track} />
                            ))}
                            {releasedTracks.length === 0 && (
                                <p className="text-muted-foreground py-8 text-center bg-muted/30 rounded-lg col-span-full">No tracks released yet.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bio */}
                <div className="animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">About</h2>
                    <div className="prose prose-invert max-w-none bg-muted/30 p-6 rounded-xl">
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {artist.bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
