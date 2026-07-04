import { getPodcasts } from "@/server/actions/podcasts"
import { getGenres } from "@/server/actions/genres"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"
import { Music2, Calendar, User } from "lucide-react"
import { GenreFilter } from "@/components/tracks/genre-filter"
import { Pagination } from "@/components/ui/pagination"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { TypePillFilter } from "@/components/shared/type-pill-filter"
import Image from "next/image"
import { PlayButton } from "@/components/shared/play-button"
import { format } from "date-fns"
import { PodcastActionBar } from "@/components/shared/podcast-action-bar"
import { Prisma } from "@prisma/client"

type PodcastWithDetails = Prisma.PodcastGetPayload<{
    include: {
        artist: true,
        genre: true
    }
}> & {
    likesCount: number
    isLiked: boolean
}

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

    // Fetch latest podcast separately for Hero (only on first page default)
    const isDefaultView = currentPage === 1 && selectedGenreId === "all" && statusParam === "published" && selectedType === "all"

    let heroPodcast: PodcastWithDetails | null = null;
    let podcasts: PodcastWithDetails[] = [];
    let totalPages = 1;

    if (isDefaultView) {
        // Fetch 1 latest
        const { podcasts: latestPodcasts } = await getPodcasts(1, 1, 'published', undefined, undefined)
        if (latestPodcasts.length > 0) {
            heroPodcast = latestPodcasts[0]
        }

        // Fetch grid content
        const [podcastsData] = await Promise.all([
            getPodcasts(currentPage, ITEMS_PER_PAGE, 'published', undefined, undefined)
        ])
        podcasts = podcastsData.podcasts.filter((p) => p.id !== heroPodcast?.id)
        totalPages = podcastsData.totalPages
    } else {
        const [podcastsData] = await Promise.all([
            getPodcasts(currentPage, ITEMS_PER_PAGE, statusParam as 'published' | 'upcoming' | 'all', selectedGenreId === "all" ? undefined : selectedGenreId, selectedType === "all" ? undefined : selectedType),
        ])
        podcasts = podcastsData.podcasts
        totalPages = podcastsData.totalPages
    }

    const [genres] = await Promise.all([getGenres()])

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

    const statusFilters = [
        { label: "New Releases", value: "published" },
        { label: "Upcoming", value: "upcoming" },
        { label: "All Podcasts", value: "all" },
    ]

    return (
        <div className="min-h-screen animate-enter-fade-in relative">

            {/* Hero Section */}
            {heroPodcast && (
                <div className="relative w-full h-[75vh] min-h-[400px] lg:h-[60vh]">
                    <div className="absolute inset-0">
                        {heroPodcast.imageUrl ? (
                            <Image
                                src={heroPodcast.imageUrl}
                                alt={heroPodcast.title}
                                fill
                                className="object-fill md:object-cover"
                                priority
                            />
                        ) : (
                            <div className="w-full h-full bg-muted" />
                        )}
                        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
                        <div className="absolute inset-0 bg-black/30" />

                        <div className="relative z-20 h-full flex items-center justify-center pointer-events-none">
                            <div className="pointer-events-auto -mt-40 md:mt-0">
                                <PlayButton
                                    track={{
                                        id: heroPodcast.id,
                                        title: heroPodcast.title,
                                        audioUrl: heroPodcast.audioUrl || "",
                                        artist: {
                                            id: heroPodcast.artist?.id || "unknown",
                                            name: heroPodcast.artist?.name || "Unknown Artist",
                                            imageUrl: heroPodcast.artist?.imageUrl
                                        },
                                        imageUrl: heroPodcast.imageUrl,
                                        scheduledFor: heroPodcast.scheduledFor,
                                        kind: "PODCAST",
                                        likesCount: heroPodcast.likesCount || 0,
                                        isLiked: heroPodcast.isLiked || false,
                                        waveformPeaks: (heroPodcast.waveformPeaks as unknown as number[]) || []
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
                                    <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border text-white bg-primary border-primary">
                                        Featured Podcast
                                    </span>
                                    {heroPodcast.type && (
                                        <span className={cn(
                                            "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider border text-white bg-primary border-primary",
                                            heroPodcast.type === "Warm" && "bg-yellow-500 border-yellow-400",
                                            heroPodcast.type === "Drive" && "bg-orange-500 border-orange-400",
                                            heroPodcast.type === "Peak" && "bg-red-500 border-red-400",
                                            !["Warm", "Drive", "Peak"].includes(heroPodcast.type) && "bg-primary border-primary"
                                        )}>
                                            {heroPodcast.type}
                                        </span>
                                    )}
                                    <span className={cn(
                                        "font-bold text-xs px-3 py-1 rounded-md border backdrop-blur-md",
                                        getGenreStyle(heroPodcast.genre?.name || ""),
                                        "text-white/90 bg-white/5"
                                    )}>
                                        {String(heroPodcast.sequence || 0).padStart(3, '0')}
                                    </span>
                                    {heroPodcast.genre && (
                                        <span className="px-3 py-1 bg-white/5 backdrop-blur-md rounded-md text-xs font-bold uppercase tracking-wider border border-white/10 text-white/90">
                                            {heroPodcast.genre.name}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-2">
                                    {heroPodcast.title}
                                </h1>

                                <div className="flex flex-wrap items-center gap-6 text-white/90">
                                    <div className="flex items-center gap-2">
                                        {heroPodcast.artist?.imageUrl ? (
                                            <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                                <Image
                                                    src={heroPodcast.artist.imageUrl}
                                                    alt={heroPodcast.artist.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                <User className="w-4 h-4" />
                                            </div>
                                        )}
                                        <span className="text-lg font-medium">{heroPodcast.artist?.name || "Unknown Artist"}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        {format(new Date(heroPodcast.scheduledFor), 'MMM d, yyyy')}
                                    </div>
                                </div>
                            </div>

                            <PodcastActionBar
                                podcastId={heroPodcast.id}
                                podcastSlug={heroPodcast.slug}
                                podcastTitle={heroPodcast.title}
                                artistName={heroPodcast.artist?.name || "Unknown"}
                                initialLikes={heroPodcast.likesCount || 0}
                                initialIsLiked={heroPodcast.isLiked || false}
                            />
                        </div>
                    </div>
                </div>
            )}

            {!heroPodcast && (
                <div className="container px-4 md:px-6 pt-24 pb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold tracking-tight bg-linear-to-br from-foreground to-foreground/60 bg-clip-text text-transparent mb-2">
                        Podcasts
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        Listen to our exclusive guest mixes and radio shows.
                    </p>
                </div>
            )}

            {/* Filters Bar */}
            <div className="container px-4 md:px-6 py-6 sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-white/5 mb-8">
                <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
                    <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-center">
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

                        <div className="w-full sm:w-auto overflow-x-auto">
                            <TypePillFilter
                                selectedType={selectedType}
                                basePath="/podcasts"
                                otherParams={{
                                    status: statusParam,
                                    genre: selectedGenreId
                                }}
                                types={[
                                    { label: "Warm", value: "Warm", colorClass: "bg-yellow-500 border-yellow-400 text-black hover:bg-yellow-400" },
                                    { label: "Drive", value: "Drive", colorClass: "bg-orange-500 border-orange-400 text-black hover:bg-orange-400" },
                                    { label: "Peak", value: "Peak", colorClass: "bg-red-500 border-red-400 text-black hover:bg-red-400" },
                                ]}
                            />
                        </div>

                        <div className="w-full sm:w-[200px] ml-auto xl:ml-0">
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

            <div className="container px-4 md:px-6 pb-20">
                <div className="w-full">
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

                {totalPages > 1 && (
                    <div className="mt-12">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            basePath="/podcasts"
                            searchParams={{ genre: selectedGenreId, status: statusParam, type: selectedType }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
