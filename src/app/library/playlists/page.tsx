"use client"

import { useUserActions } from "@/contexts/user-actions-context"
import { Button } from "@/components/ui/button"
import { ListMusic, Plus, Clock, Music2 } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import { PlaylistDialog } from "@/components/shared/playlist-dialog"
import { DeletePlaylistButton } from "@/components/shared/delete-playlist-button"
import { useState } from "react"

export default function PlaylistsPage() {
    const { playlists, fetchPlaylists } = useUserActions()
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

    useEffect(() => {
        fetchPlaylists()
    }, [fetchPlaylists])

    return (
        <div className="container py-8 px-4 md:px-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Your Playlists</h1>
                    <p className="text-muted-foreground mt-1">Manage and listen to your curated collections.</p>
                </div>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Playlist
                </Button>
            </div>

            {playlists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <ListMusic className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">No playlists yet</h2>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Create your first playlist to start organizing your favorite tracks.
                    </p>
                    <Button variant="outline" className="mt-6" onClick={() => setIsCreateDialogOpen(true)}>
                        Create Playlist
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {playlists.map((playlist) => (
                        <Link key={playlist.id} href={`/library/playlists/${playlist.id}`}>
                            <div className="group bg-[#1A1A1A] border border-white/5 rounded-xl p-4 hover:bg-white/5 transition-all relative">
                                <div className="absolute top-6 right-6 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <DeletePlaylistButton playlistId={playlist.id} />
                                </div>
                                <div className="aspect-square rounded-lg bg-zinc-800 flex items-center justify-center mb-4 relative overflow-hidden">
                                    <ListMusic className="h-12 w-12 text-zinc-600 group-hover:scale-110 transition-transform" />
                                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <h3 className="font-bold text-lg truncate">{playlist.name}</h3>
                                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-500">
                                    <div className="flex items-center gap-1.5">
                                        <Music2 className="h-3.5 w-3.5" />
                                        <span>{(playlist._count?.tracks || 0) + (playlist._count?.podcasts || 0)} items</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="h-3.5 w-3.5" />
                                        <span>Updated {new Date(playlist.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <PlaylistDialog
                isOpen={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
            />
        </div>
    )
}
