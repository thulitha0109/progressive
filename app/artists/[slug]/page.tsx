import { getArtistBySlug } from "@/app/actions/artists"
import { Button } from "@/components/ui/button"
import { PlayButton } from "@/components/play-button"
import { LikeButton } from "@/components/like-button"
import { Calendar, Play, User } from "lucide-react"
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
                            className="h-full w-full object-cover opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}
                <div className="container relative flex h-full flex-col justify-end px-4 md:px-6 pb-8">
                    <div className="flex items-end gap-6">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-xl">
                            {artist.imageUrl ? (
                                <img
                                    src={artist.imageUrl}
                                    alt={artist.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <User className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                        <div className="mb-2">
                            <h1 className="text-4xl font-bold tracking-tight">{artist.name}</h1>
                            <p className="text-muted-foreground">Artist</p>
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
                                <Button asChild size="sm" variant="ghost">
                                    <PlayButton track={track} />
                                </Button>
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
