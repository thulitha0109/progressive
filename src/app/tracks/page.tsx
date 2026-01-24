import { getTracks } from "@/server/actions/tracks"
import { getGenres } from "@/server/actions/genres"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { GenreFilter } from "@/components/tracks/genre-filter"
import { TypePillFilter } from "@/components/shared/type-pill-filter"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { PlayButton } from "@/components/shared/play-button"
import { Calendar, User } from "lucide-react"
import { format } from "date-fns"
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

export const dynamic = 'force-dynamic'

export default async function TracksPage({
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

    // Fetch latest track separately for Hero (only if on first page and default filters)
    const isDefaultView = currentPage === 1 && selectedGenreId === "all" && statusParam === "published" && selectedType === "all"

    let heroTrack: TrackWithDetails | null = null;
    let tracks: TrackWithDetails[] = [];
    let totalPages = 1;

    if (isDefaultView) {
        // Fetch 1 latest track for hero
        const { tracks: latestTracks } = await getTracks(1, 1, undefined, 'published', undefined)
        if (latestTracks.length > 0) {
            heroTrack = latestTracks[0]
        }

        // Fetch rest for grid, skipping the first one
        // We can't easily "skip" in the same query without messing up pagination logic complexly, 
        // asking 13 items and slicing is easier but getTracks is paginated.
        // For simplicity, we'll fetch page 1 normally. If hero exists and is in the list, we filter it out visually.
        const [tracksData] = await Promise.all([
            getTracks(currentPage, ITEMS_PER_PAGE, undefined, 'published', undefined)
        ])
        tracks = tracksData.tracks.filter((t) => t.id !== heroTrack?.id)
        totalPages = tracksData.totalPages
    } else {
        const [tracksData] = await Promise.all([
            getTracks(currentPage, ITEMS_PER_PAGE, selectedGenreId === "all" ? undefined : selectedGenreId, statusParam as 'published' | 'upcoming' | 'all', selectedType === "all" ? undefined : selectedType),
        ])
        tracks = tracksData.tracks
        totalPages = tracksData.totalPages
    }

    const [genres] = await Promise.all([getGenres()])

    const statusFilters = [
        { label: "New Releases", value: "published" },
        { label: "Upcoming", value: "upcoming" },
        { label: "All Tracks", value: "all" },
    ]

    return (
        <div className="min-h-screen animate-enter-fade-in relative">

            {/* Hero Section */}
            {heroTrack && (
                <div className="relative w-full h-[50vh] min-h-[400px] lg:h-[60vh]">
                    <div className="absolute inset-0">
                        {heroTrack.imageUrl ? (
                            <Image
                                src={heroTrack.imageUrl}
                                alt={heroTrack.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-muted" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-black/30" />

                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none pb-24 md:pb-0">
                            <div className="pointer-events-auto">
                                <PlayButton
                                    track={{
                                        ...heroTrack,
                                        kind: "TRACK",
                                        likesCount: heroTrack.likesCount || 0,
                                        isLiked: heroTrack.isLiked || false,
                                        waveformPeaks: (heroTrack.waveformPeaks as unknown as number[]) || []
                                    }}
                                    variant="glass"
                                    className="h-20 w-20 md:h-24 md:w-24"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="container relative h-full flex flex-col justify-end pb-12 z-10 px-4 md:px-6">
                        <div className="flex flex-col md:flex-row gap-8 items-start md:items-end">
                            <div className="flex-1 space-y-4 w-full">
                                <div className="flex flex-wrap items-center gap-3 text-white/80">
                                    <span className="px-3 py-1 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider rounded-md">
                                        Featured Release
                                    </span>
                                    {heroTrack.genreRel && (
                                        <span className="px-3 py-1 bg-white/10 backdrop-blur-md text-white/90 text-xs font-bold uppercase tracking-wider rounded-md border border-white/10">
                                            {heroTrack.genreRel.name}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2">
                                    {heroTrack.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        {heroTrack.artist?.imageUrl ? (
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                                <Image
                                                    src={heroTrack.artist.imageUrl}
                                                    alt={heroTrack.artist.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className="text-lg font-medium">{heroTrack.artist?.name || "Unknown Artist"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(heroTrack.scheduledFor), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <TrackActionBar
                                trackId={heroTrack.id}
                                trackTitle={heroTrack.title}
                                artistName={heroTrack.artist?.name || "Unknown"}
                                initialLikes={heroTrack.likesCount || 0}
                                initialIsLiked={heroTrack.isLiked || false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!heroTrack && (
                <div className="container px-4 md:px-6 pt-10 pb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                        Tracks
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Explore our collection of progressive sounds.
                    </p>
                </div>
            )}

            {/* Filters Bar */}
            <div className="container px-4 md:px-6 py-6 sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-white/5 mb-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
                        {/* Status Links */}
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

                        {/* Type Pills */}
                        <div className="w-full sm:w-auto overflow-x-auto">
                            <TypePillFilter
                                selectedType={selectedType}
                                basePath="/tracks"
                                otherParams={{
                                    status: statusParam,
                                    genre: selectedGenreId
                                }}
                                types={[
                                    { label: "Original", value: "Original", colorClass: "bg-white text-black border-white hover:bg-gray-200" },
                                    { label: "Remix", value: "Remix", colorClass: "bg-white text-black border-white hover:bg-gray-200" },
                                    { label: "Bootleg", value: "Bootleg", colorClass: "bg-white text-black border-white hover:bg-gray-200" },
                                    { label: "Mashup", value: "Mashup", colorClass: "bg-white text-black border-white hover:bg-gray-200" },
                                ]}
                            />
                        </div>

                        {/* Genre Dropdown */}
                        <div className="w-full sm:w-[200px] ml-auto xl:ml-0">
                            <GenreFilter
                                genres={genres}
                                selectedGenreId={selectedGenreId}
                                status={validStatus}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 pb-20">
                <div className="w-full">
                    {tracks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {tracks.map((track) => (
                                <NewReleaseCard
                                    key={track.id}
                                    track={track}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-32 text-center border-2 border-dashed rounded-md border-muted">
                            <p className="text-xl font-medium text-muted-foreground">No tracks found matching your criteria.</p>
                            <p className="text-sm text-muted-foreground/60 mt-2">Try selecting a different genre or status.</p>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/tracks"
                            searchParams={{ genre: selectedGenreId, status: statusParam, type: selectedType }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
