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
            <div className="relative h-[300px] w-full overflow-hidden bg-muted">
                {artist.imageUrl && (
                    <div className="absolute inset-0">
                        <img
                            src={artist.imageUrl}
                            alt={artist.name}
                            className="h-full w-full object-cover object-top opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}
                <div className="container relative flex h-full flex-col justify-end px-4 md:px-6 pb-8">
                    <div className="flex flex-col md:flex-row md:items-end gap-6">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-xl shrink-0">
                            {artist.imageUrl ? (
                                <img
                                    src={artist.imageUrl}
                                    alt={artist.name}
                                    className="h-full w-full object-cover object-top"
                                />
                            ) : (
                                <User className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                        <div className="mb-2 w-full">
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight break-words">{artist.name}</h1>
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                                <p className="text-muted-foreground">Artist</p>
                                <FollowButton artistId={artist.id} />
                            </div>
                            {artist.socialLinks && (
                                <div className="flex flex-wrap gap-4 mt-4">
                                    {(() => {
                                        const links = artist.socialLinks as any
                                        return (
                                            <>
                                                {links.instagram && (
                                                    <a href={links.instagram} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/instagram.svg" alt="Instagram" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.youtube && (
                                                    <a href={links.youtube} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/youtube.svg" alt="YouTube" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.mixcloud && (
                                                    <a href={links.mixcloud} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/mixcloud.svg" alt="Mixcloud" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.soundcloud && (
                                                    <a href={links.soundcloud} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/soundcloud.svg" alt="SoundCloud" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.facebook && (
                                                    <a href={links.facebook} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/fb.svg" alt="Facebook" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.spotify && (
                                                    <a href={links.spotify} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                                                        <img src="/images/ICONS/spotify.svg" alt="Spotify" className="h-6 w-6" />
                                                    </a>
                                                )}
                                                {links.tiktok && (
                                                    <a href={links.tiktok} target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
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
            </div>

            <div className="container px-4 md:px-6 py-8 grid gap-10 md:grid-cols-[2fr_1fr]">
                {/* Tracks */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">Tracks</h2>
                    <div className="space-y-2">
                        {artist.tracks.map((track) => (
                            <div
                                key={track.id}
                                className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors"
                            >
                                <div className="flex items-center justify-center h-10 w-10 rounded bg-primary/10 text-primary">
                                    <Play className="h-5 w-5 ml-0.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-medium truncate">{track.title}</h3>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(track.scheduledFor).toLocaleDateString()}
                                    </div>
                                </div>
                                <LikeButton
                                    trackId={track.id}
                                    initialLikes={track.likesCount}
                                    initialIsLiked={track.isLiked}
                                />
                                {track.isReleased ? (
                                    <Button asChild size="sm" variant="ghost">
                                        <PlayButton track={track} />
                                    </Button>
                                ) : (
                                    <div className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                                        Upcoming
                                    </div>
                                )}
                            </div>
                        ))}
                        {artist.tracks.length === 0 && (
                            <p className="text-muted-foreground">No tracks released yet.</p>
                        )}
                    </div>
                </div>

                {/* Bio */}
                <div>
                    <h2 className="text-2xl font-bold tracking-tight mb-6">About</h2>
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                            {artist.bio}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
