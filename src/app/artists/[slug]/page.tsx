import { getArtistBySlug } from "@/server/actions/artists"
import { Button } from "@/components/ui/button"
import { PlayButton } from "@/components/shared/play-button"
import { LikeButton } from "@/components/shared/like-button"
import { FollowButton } from "@/components/artist/follow-button"
import { Calendar, Play, User } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

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

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero / Header */}
            <div className="relative h-[300px] md:h-[350px] w-full overflow-hidden bg-muted">
                {artist.imageUrl && (
                    <div className="absolute inset-0">
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="h-full w-full object-cover object-top opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                    </div>
                )}
            </div>

            <div className="px-4 md:px-8 relative z-10 -mt-32 md:-mt-40 mb-10">
                <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-8">
                    <div className="h-40 w-40 md:h-52 md:w-52 overflow-hidden rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-2xl shrink-0">
                        {artist.imageUrl ? (
                            <img
                                src={artist.imageUrl}
                                alt={artist.name}
                                className="h-full w-full object-cover object-top"
                            />
                        ) : (
                            <User className="h-20 w-20 text-muted-foreground" />
                        )}
                    </div>
                    <div className="flex-1 mb-2 md:mb-6 space-y-4">
                        <div>
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight break-words">{artist.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-4">
                                <p className="text-muted-foreground text-lg">Artist</p>
                                <FollowButton artistId={artist.id} initialIsFollowing={artist.isFollowing} />
                            </div>
                        </div>

                        {artist.socialLinks && (
                            <div className="flex flex-wrap gap-4">
                                {(() => {
                                    const links = artist.socialLinks as any
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

            <div className="px-4 md:px-8 py-8 grid gap-12 lg:grid-cols-[2fr_1fr]">
                {/* Tracks */}
                <div className="space-y-12">
                    {/* Upcoming Tracks */}
                    {artist.tracks.some(track => !track.isReleased) && (
                        <div className="animate-slide-up-fade" style={{ animationDelay: "0.05s" }}>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold tracking-tight">Upcoming Releases</h2>
                                <span className="text-sm text-muted-foreground">{artist.tracks.filter((track) => !track.isReleased).length} tracks</span>
                            </div>
                            <div className="space-y-2">
                                {artist.tracks
                                    .filter((track) => !track.isReleased)
                                    .map((track) => (
                                        <div
                                            key={track.id}
                                            className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors overflow-hidden opacity-80"
                                        >
                                            <div className="flex items-center justify-center h-12 w-12 rounded bg-muted text-muted-foreground shrink-0 border border-dashed">
                                                <Calendar className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium truncate pr-2 text-lg">{track.title}</h3>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(track.scheduledFor).toLocaleDateString(undefined, {
                                                        weekday: 'short',
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                            </div>
                                            <div className="shrink-0">
                                                <span className="text-xs font-bold uppercase tracking-wider border px-2 py-1 rounded-md text-muted-foreground">
                                                    Upcoming
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}

                    {/* Released Tracks */}
                    <div className="animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold tracking-tight">Released Tracks</h2>
                            <span className="text-sm text-muted-foreground">{artist.tracks.filter((track) => track.isReleased).length} tracks</span>
                        </div>
                        <div className="space-y-2">
                            {artist.tracks
                                .filter((track) => track.isReleased)
                                .map((track) => (
                                    <div
                                        key={track.id}
                                        className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors overflow-hidden"
                                    >
                                        <div className="flex items-center justify-center h-12 w-12 rounded bg-primary/10 text-primary shrink-0">
                                            <PlayButton track={track} variant="icon" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium truncate pr-2 text-lg">{track.title}</h3>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {new Date(track.scheduledFor).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div className="shrink-0">
                                            <LikeButton
                                                trackId={track.id}
                                                initialLikes={track.likesCount}
                                                initialIsLiked={track.isLiked}
                                            />
                                        </div>
                                    </div>
                                ))}
                            {artist.tracks.filter((track) => track.isReleased).length === 0 && (
                                <p className="text-muted-foreground py-8 text-center bg-muted/30 rounded-lg">No tracks released yet.</p>
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
