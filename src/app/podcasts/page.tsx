import { getPodcasts } from "@/server/actions/podcasts"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { Music2 } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function PodcastsPage() {
    const { podcasts } = await getPodcasts(1, 100) // Fetch more for now, implement pagination later if needed

    return (
        <div className="container py-10 px-4 md:px-8 min-h-screen animate-enter-fade-in relative max-w-[1400px]">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 z-10 relative">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Podcasts
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Listen to our exclusive guest mixes and radio shows.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4">
                    {podcasts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {podcasts.map((podcast) => (
                                <NewReleaseCard
                                    key={podcast.id}
                                    track={{
                                        ...podcast,
                                        artist: {
                                            id: podcast.artist?.id || "unknown",
                                            name: podcast.artist?.name || "Unknown Artist",
                                            imageUrl: podcast.artist?.imageUrl
                                        },
                                        type: podcast.type || null,
                                        genre: podcast.genre?.name || null, // Fix: Override spread genre object with string
                                        genreRel: podcast.genre ? {
                                            name: podcast.genre.name
                                        } : null,
                                        // Mock likes as Podcast model doesn't support it yet
                                        likesCount: 0,
                                        isLiked: false
                                    }}
                                    hideLikeButton={true}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-md border-muted">
                            <Music2 className="h-12 w-12 text-muted-foreground mb-4" />
                            <p className="text-xl font-medium text-muted-foreground">No podcasts found.</p>
                            <p className="text-sm text-muted-foreground/60 mt-2">Check back later for new episodes.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
