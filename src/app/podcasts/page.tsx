import { getPodcasts } from "@/server/actions/podcasts"
import { getGenres } from "@/server/actions/genres"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"
import { Music2 } from "lucide-react"
import { GenreFilter } from "@/components/tracks/genre-filter"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { cn } from "@/lib/utils"

export const dynamic = 'force-dynamic'

export default async function PodcastsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; genre?: string; status?: string; type?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const selectedGenreId = params.genre || "all"
    const statusParam = params.status || "published"
    const selectedType = params.type || "all"
    const ITEMS_PER_PAGE = 12

    const validStatus = (statusParam === 'published' || statusParam === 'upcoming' || statusParam === 'all')
        ? statusParam
        : 'published';

    const [podcastsData, genres] = await Promise.all([
        getPodcasts(currentPage, ITEMS_PER_PAGE, statusParam as any, selectedGenreId === "all" ? undefined : selectedGenreId, selectedType === "all" ? undefined : selectedType),
        getGenres()
    ])

    const { podcasts, totalPages } = podcastsData

    const statusFilters = [
        { label: "New Releases", value: "published" },
        { label: "Upcoming", value: "upcoming" },
        { label: "All Podcasts", value: "all" },
    ]

    const typeFilters = [
        { label: "All Types", value: "all" },
        { label: "Warm", value: "Warm" },
        { label: "Drive", value: "Drive" },
        { label: "Peak", value: "Peak" },
    ]

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

                        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                            <div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/50 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
                                {statusFilters.map((filter) => (
                                    <Link
                                        key={filter.value}
                                        href={`/podcasts?status=${filter.value}&genre=${selectedGenreId}&type=${selectedType}`}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all",
                                            validStatus === filter.value
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                        )}
                                    >
                                        {filter.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/50 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
                                {typeFilters.map((filter) => (
                                    <Link
                                        key={filter.value}
                                        href={`/podcasts?status=${statusParam}&genre=${selectedGenreId}&type=${filter.value}`}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all",
                                            selectedType === filter.value
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                                        )}
                                    >
                                        {filter.label}
                                    </Link>
                                ))}
                            </div>

                            <div className="w-full sm:w-[240px]">
                                <GenreFilter
                                    genres={genres}
                                    selectedGenreId={selectedGenreId}
                                    status={validStatus}
                                    basePath="/podcasts"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4">
                    {podcasts.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {podcasts.map((podcast) => (
                                <NewPodcastCard
                                    key={podcast.id}
                                    podcast={{
                                        ...podcast,
                                        artist: {
                                            id: podcast.artist?.id || "unknown",
                                            name: podcast.artist?.name || "Unknown Artist",
                                            imageUrl: podcast.artist?.imageUrl
                                        },
                                        type: podcast.type || "PODCAST",
                                        genre: podcast.genre?.name || null,
                                        genreRel: podcast.genre ? {
                                            name: podcast.genre.name
                                        } : null,
                                        likesCount: podcast.likesCount,
                                        isLiked: podcast.isLiked,
                                        kind: "PODCAST"
                                    }}
                                    hideLikeButton={false}
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
            {totalPages > 1 && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/podcasts"
                    searchParams={{ genre: selectedGenreId, status: statusParam, type: selectedType }}
                />
            )}
        </div>
    )
}
