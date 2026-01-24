import { getUpcomingTracks } from "@/server/actions/tracks"
import { NewReleaseCard } from "@/components/shared/new-release-card"

export default async function UpcomingTracksPage() {
    // Fetch upcoming tracks
    const tracks = await getUpcomingTracks()

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-6 md:gap-10">
                <div className="flex flex-col gap-2 border-b pb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Upcoming Releases</h1>
                    <p className="text-muted-foreground text-lg">
                        Be the first to hear what's coming next.
                    </p>
                </div>

                {tracks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tracks.map((track) => (
                            <NewReleaseCard
                                key={track.id}
                                track={{
                                    ...track,
                                    // Ensure compatibility with ReleaseItem interface
                                    likesCount: track._count?.likedBy || 0,
                                    isLiked: false, // Server component doesn't inherently check likes unless we auth check, but getUpcomingTracks might not include it. Update action if needed.
                                    kind: "TRACK"
                                }}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center border rounded-lg bg-muted/10 border-dashed">
                        <p className="text-xl font-medium text-muted-foreground">No upcoming tracks scheduled at the moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back later or follow us on social media for updates.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
