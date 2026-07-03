"use client"

import { useUserActions } from "@/contexts/user-actions-context"
import { Music2, Heart, Play } from "lucide-react"
import { useEffect, useState } from "react"
import { getLikedTracks } from "@/server/actions/tracks"
import { getLikedPodcasts } from "@/server/actions/podcasts"
import { useSession } from "next-auth/react"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function LibraryLikedPage() {
    const { data: session } = useSession()
    const [likedTracks, setLikedTracks] = useState<any[]>([])
    const [likedPodcasts, setLikedPodcasts] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (!session?.user?.id) return

        async function fetchData() {
            try {
                const [tracks, podcasts] = await Promise.all([
                    getLikedTracks(session!.user.id),
                    getLikedPodcasts(session!.user.id)
                ])
                setLikedTracks(tracks)
                setLikedPodcasts(podcasts)
            } finally {
                setIsLoading(false)
            }
        }
        fetchData()
    }, [session?.user?.id])

    return (
        <div className="container py-8 px-4 md:px-8 space-y-8">
            <div className="flex items-center gap-4">
                <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-linear-to-br from-red-500 to-red-900 flex items-center justify-center shadow-lg">
                    <Heart className="h-8 w-8 md:h-10 md:w-10 text-white fill-current" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Liked Collection</h1>
                    <p className="text-muted-foreground mt-1">Ready to listen: {likedTracks.length + likedPodcasts.length} items</p>
                </div>
            </div>

            <Tabs defaultValue="tracks" className="w-full">
                <TabsList className="mb-6 bg-white/5 p-1 border border-white/10 rounded-xl w-full max-w-md">
                    <TabsTrigger value="tracks" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold h-10 transition-all uppercase tracking-widest text-[11px]">
                        Tracks ({likedTracks.length})
                    </TabsTrigger>
                    <TabsTrigger value="podcasts" className="flex-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-black font-bold h-10 transition-all uppercase tracking-widest text-[11px]">
                        Podcasts ({likedPodcasts.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="tracks" className="space-y-4 outline-none">
                    {isLoading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-white/5 rounded-lg animate-pulse" />)}
                        </div>
                    ) : likedTracks.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-xl bg-muted/10 border-white/5">
                            <Music2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Catch some beats. You haven't liked any tracks yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {likedTracks.map((track) => (
                                <NewReleaseCard key={track.id} track={{
                                    ...track,
                                    likesCount: track._count?.likedBy || 0,
                                    isLiked: true,
                                    kind: "TRACK"
                                } as any} />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="podcasts" className="space-y-4 outline-none">
                    {isLoading ? (
                        <div className="grid gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-28 w-full bg-white/5 rounded-lg animate-pulse" />)}
                        </div>
                    ) : likedPodcasts.length === 0 ? (
                        <div className="py-20 text-center border border-dashed rounded-xl bg-muted/10 border-white/5">
                            <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                            <p className="text-muted-foreground">Deep dive into voices. You haven't liked any podcasts yet.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {likedPodcasts.map((podcast) => (
                                <NewPodcastCard key={podcast.id} podcast={{
                                    ...podcast,
                                    artist: {
                                        id: podcast.artist?.id || "unknown",
                                        name: podcast.artist?.name || "Unknown",
                                        imageUrl: podcast.artist?.imageUrl
                                    },
                                    type: podcast.type || "PODCAST",
                                    genre: podcast.genre?.name || null,
                                    genreRel: podcast.genre ? { name: podcast.genre.name } : null,
                                    likesCount: podcast._count?.likedBy || 0,
                                    isLiked: true,
                                    kind: "PODCAST"
                                } as any} />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
