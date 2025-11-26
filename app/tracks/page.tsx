import { getTracks } from "@/app/actions/tracks"
import { getGenres } from "@/app/actions/genres"
import { PlayButton } from "@/components/play-button"
import { LikeButton } from "@/components/like-button"
import { User, Calendar } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

export default async function TracksPage({
    searchParams,
}: {
    searchParams: Promise<{ genre?: string }>
}) {
    const params = await searchParams
    const selectedGenreId = params.genre || "all"

    // Fetch tracks and genres in parallel
    const [tracksData, genres] = await Promise.all([
        getTracks(1, 100, selectedGenreId === "all" ? undefined : selectedGenreId),
        getGenres()
    ])

    const { tracks } = tracksData

    // Create a map for easy genre lookup if needed, though tracks might have genre relation loaded if we update getTracks
    // For now, we rely on what getTracks returns. We should update getTracks to include genre relation.

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-4 md:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">All Tracks</h1>
                        <p className="text-muted-foreground">
                            Explore our complete collection of progressive sounds.
                        </p>
                    </div>

                    {/* Genre Filter */}
                    <div className="w-full sm:w-[200px]">
                        <Select value={selectedGenreId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genres</SelectItem>
                                {genres.filter((g: any) => !g.parentId).map((parent: any) => (
                                    <div key={parent.id}>
                                        <SelectItem value={parent.id} className="font-semibold">
                                            {parent.name}
                                        </SelectItem>
                                        {genres
                                            .filter((g: any) => g.parentId === parent.id)
                                            .map((sub: any) => (
                                                <SelectItem key={sub.id} value={sub.id} className="pl-6 text-muted-foreground">
                                                    {sub.name}
                                                </SelectItem>
                                            ))
                                        }
                                    </div>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4">
                    {tracks.map((track: any) => (
                        <div
                            key={track.id}
                            className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors"
                        >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                                {track.imageUrl ? (
                                    <img
                                        src={track.imageUrl}
                                        alt={track.title}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-muted-foreground">
                                        <User className="h-6 w-6" />
                                    </div>
                                )}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                                    <PlayButton track={track} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold truncate text-lg">{track.title}</h3>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span className="truncate">{track.artist.name}</span>
                                        {/* Display Genre Name if available. We need to fetch it in getTracks or find it here */}
                                        {track.genreRel?.name && (
                                            <>
                                                <span className="text-muted-foreground/50">•</span>
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                                    {track.genreRel.name}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                                <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-4">
                                    <Calendar className="h-4 w-4" />
                                    {new Date(track.scheduledFor).toLocaleDateString()}
                                </div>
                                <LikeButton
                                    trackId={track.id}
                                    initialLikes={track.likesCount}
                                    initialIsLiked={track.isLiked}
                                />
                            </div>
                        </div>
                    ))}
                    {tracks.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            No tracks found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
