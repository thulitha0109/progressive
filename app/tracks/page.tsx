import { getTracks } from "@/app/actions/tracks"
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

// Define available genres (should match your schema)
const GENRES = [
    "Progressive House",
    "Techno",
    "Trance",
    "Progressive Trance",
    "Melodic Techno",
    "Deep House",
    "Tech House",
]

export default async function TracksPage({
    searchParams,
}: {
    searchParams: Promise<{ genre?: string }>
}) {
    const params = await searchParams
    const selectedGenre = params.genre || "all"
    const { tracks } = await getTracks(1, 100, selectedGenre === "all" ? undefined : selectedGenre)

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
                        <Select value={selectedGenre}>
                            <SelectTrigger>
                                <SelectValue placeholder="Filter by genre" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Genres</SelectItem>
                                {GENRES.map((genre) => (
                                    <SelectItem key={genre} value={genre}>
                                        {genre}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid gap-4">
                    {tracks.map((track) => (
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
                                        {track.genre && (
                                            <>
                                                <span className="text-muted-foreground/50">•</span>
                                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
                                                    {track.genre}
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
                            No tracks found{selectedGenre !== "all" && ` for ${selectedGenre}`}.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
