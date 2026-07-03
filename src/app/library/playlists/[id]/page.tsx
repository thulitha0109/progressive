import { getPlaylistById } from "@/server/actions/playlists"
import { notFound, redirect } from "next/navigation"
import { auth } from "@/auth"
import { Music2, Clock, Play, Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { NewPodcastCard } from "@/components/shared/new-podcast-card"
import { RemoveFromPlaylistButton } from "@/components/shared/remove-from-playlist-button"
import { cn } from "@/lib/utils"

export default async function PlaylistDetailPage({ params }: { params: { id: string } }) {
    const session = await auth()
    if (!session?.user) {
        redirect("/auth/login")
    }

    const { playlist, error } = await getPlaylistById(params.id)

    if (error || !playlist) {
        notFound()
    }

    const totalItems = (playlist.tracks?.length || 0) + (playlist.podcasts?.length || 0)

    // Combine and sort by addedAt if needed, but for now just list them
    const tracks = playlist.tracks || []
    const podcasts = playlist.podcasts || []

    return (
        <div className="container py-8 px-4 md:px-8 space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row gap-8 items-end">
                <div className="w-full md:w-64 lg:w-72 aspect-square bg-linear-to-br from-zinc-800 to-zinc-950 rounded-2xl flex items-center justify-center shadow-2xl shrink-0 group relative overflow-hidden border border-white/5">
                    <Music2 className="h-28 w-28 text-zinc-700 transition-transform duration-500 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex flex-col justify-end gap-3 py-2 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <Library className="h-4 w-4 text-primary" />
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary/80">Public Playlist</p>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter truncate">{playlist.name}</h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">{playlist.description || "No description provided."}</p>

                    <div className="flex items-center gap-4 mt-6">
                        <div className="flex -space-x-2">
                            <div className="h-8 w-8 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center text-[10px] font-bold">
                                {session.user.name?.[0]?.toUpperCase()}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <span className="text-foreground">{session.user.name}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-foreground">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-6 pt-4">
                <Button className="rounded-full h-14 w-14 p-0 flex items-center justify-center bg-primary hover:bg-primary/90 text-black shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                    <Play className="h-7 w-7 fill-current ml-1" />
                </Button>
            </div>

            {/* List Section */}
            <div className="space-y-8 pb-20">
                {totalItems === 0 ? (
                    <div className="py-24 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/2">
                        <Music2 className="h-12 w-12 mx-auto mb-4 text-zinc-700" />
                        <h3 className="text-xl font-medium text-zinc-400">Your playlist is looking a bit empty</h3>
                        <p className="text-zinc-500 mt-2">Start adding tracks and podcasts to build your collection.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {/* Tracks Section */}
                        {tracks.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 opacity-50">
                                    <Music2 className="h-4 w-4" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest">Tracks ({tracks.length})</h2>
                                </div>
                                <div className="grid gap-4">
                                    {tracks.map(({ track }) => (
                                        <div key={track.id} className="relative group">
                                            <NewReleaseCard track={{
                                                ...track,
                                                likesCount: (track as any)._count?.likedBy || 0,
                                                isLiked: false,
                                                kind: "TRACK"
                                            } as any} />
                                            <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-12 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <RemoveFromPlaylistButton
                                                    playlistId={playlist.id}
                                                    itemId={track.id}
                                                    type="TRACK"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Podcasts Section */}
                        {podcasts.length > 0 && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 opacity-50 pt-4">
                                    <Play className="h-4 w-4" />
                                    <h2 className="text-sm font-bold uppercase tracking-widest">Podcasts ({podcasts.length})</h2>
                                </div>
                                <div className="grid gap-4">
                                    {podcasts.map(({ podcast }) => (
                                        <div key={podcast.id} className="relative group">
                                            <NewPodcastCard podcast={{
                                                ...podcast,
                                                artist: {
                                                    id: podcast.artist?.id || "unknown",
                                                    name: podcast.artist?.name || "Unknown",
                                                    imageUrl: podcast.artist?.imageUrl
                                                },
                                                type: podcast.type || "PODCAST",
                                                genre: podcast.genre?.name || null,
                                                genreRel: podcast.genre ? { name: podcast.genre.name } : null,
                                                likesCount: (podcast as any)._count?.likedBy || 0,
                                                isLiked: false,
                                                kind: "PODCAST"
                                            } as any} />
                                            <div className="absolute top-1/2 -translate-y-1/2 right-6 sm:right-12 z-40 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                                <RemoveFromPlaylistButton
                                                    playlistId={playlist.id}
                                                    itemId={podcast.id}
                                                    type="PODCAST"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
