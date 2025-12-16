import { getTracks } from "@/server/actions/tracks"
import { getGenres } from "@/server/actions/genres"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { GenreFilter } from "@/components/tracks/genre-filter"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { cn } from "@/lib/utils"
// import { Track } from "@prisma/client"

export const dynamic = 'force-dynamic'

export default async function TracksPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; genre?: string; status?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const selectedGenreId = params.genre || "all"
    const statusParam = params.status || "published"
    const ITEMS_PER_PAGE = 12

    const validStatus = (statusParam === 'published' || statusParam === 'upcoming' || statusParam === 'all')
        ? statusParam
        : 'published';

    const [tracksData, genres] = await Promise.all([
        getTracks(currentPage, ITEMS_PER_PAGE, selectedGenreId === "all" ? undefined : selectedGenreId, validStatus),
        getGenres()
    ])

    const { tracks, totalPages } = tracksData

    const statusFilters = [
        { label: "New Releases", value: "published" },
        { label: "Upcoming", value: "upcoming" },
        { label: "All Tracks", value: "all" },
    ]

    return (
        <div className="container py-10 px-4 md:px-8 min-h-screen animate-enter-fade-in relative max-w-[1400px]">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-6 z-10 relative">
                    <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
                                Tracks
                            </h1>
                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Explore our collection of progressive sounds.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
                            <div className="flex items-center p-1 bg-muted/40 rounded-lg border border-border/50 self-start sm:self-auto w-full sm:w-auto overflow-x-auto">
                                {statusFilters.map((filter) => (
                                    <Link
                                        key={filter.value}
                                        href={`/tracks?status=${filter.value}&genre=${selectedGenreId}`}
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

                            <div className="w-full sm:w-[240px]">
                                <GenreFilter
                                    genres={genres}
                                    selectedGenreId={selectedGenreId}
                                    status={validStatus}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="w-full mt-4">
                    {tracks.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {tracks.map((track) => (
                                <NewReleaseCard
                                    key={track.id}
                                    track={track}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-3xl border-muted">
                            <p className="text-xl font-medium text-muted-foreground">No tracks found matching your criteria.</p>
                            <p className="text-sm text-muted-foreground/60 mt-2">Try selecting a different genre or status.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        basePath="/tracks"
                        searchParams={{ genre: selectedGenreId, status: validStatus }}
                    />
                )}
            </div>
        </div>
    )
}
