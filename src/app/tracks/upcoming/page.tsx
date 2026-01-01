import { getUpcomingTracks } from "@/server/actions/tracks"
import Image from "next/image"
import { PlayButton } from "@/components/shared/play-button"
import { LikeButton } from "@/components/shared/like-button"
import { User, Calendar } from "lucide-react"

export default async function UpcomingTracksPage() {
    const tracks = await getUpcomingTracks()

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-4 md:gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Upcoming Releases</h1>
                    <p className="text-muted-foreground">
                        Be the first to hear what's coming next.
                    </p>
                </div>

                <div className="grid gap-4">
                    {tracks.map((track) => (
                        <div
                            key={track.id}
                            className="group flex items-center gap-4 rounded-lg border p-3 hover:bg-accent transition-colors"
                        >
                            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-muted">
                                {track.imageUrl ? (
                                    <Image
                                        src={track.imageUrl}
                                        alt={track.title}
                                        fill
                                        className="object-cover opacity-70"
                                        sizes="64px"
                                    />
                                ) : (
                                    <User className="h-8 w-8 m-auto text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                    <div className="rounded-full bg-background/90 px-2 py-1 text-[10px] font-medium flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {new Date(track.scheduledFor).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate text-lg">{track.title}</h3>
                                <p className="text-muted-foreground truncate">
                                    {track.artist.name}
                                </p>
                            </div>
                            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground mr-4">
                                Coming {new Date(track.scheduledFor).toLocaleDateString()}
                            </div>
                            <LikeButton
                                trackId={track.id}
                                initialLikes={0}
                                initialIsLiked={false}
                            />
                        </div>
                    ))}
                    {tracks.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            No upcoming tracks scheduled.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
