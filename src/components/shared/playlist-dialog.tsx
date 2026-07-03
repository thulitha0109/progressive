"use client"

import { useUserActions } from "@/contexts/user-actions-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useState, useEffect, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ListPlus, Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/components/shared/player-context"

export function PlaylistDialog({
    isOpen: propIsOpen,
    onOpenChange: propOnOpenChange
}: {
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void
} = {}) {
    const {
        isPlaylistDialogOpen: ctxIsOpen,
        setPlaylistDialogOpen: ctxOnOpenChange,
        selectedItemIdForPlaylist,
        selectedItemTypeForPlaylist,
        playlists,
        isPlaylistsLoading,
        fetchPlaylists,
        handleCreatePlaylist: ctxHandleCreatePlaylist,
        handleAddItemToPlaylist: ctxHandleAddItemToPlaylist
    } = useUserActions()

    const { data: session } = useSession()
    const router = useRouter()
    const { setIsFullScreen } = usePlayer()

    const isOpen = propIsOpen !== undefined ? propIsOpen : ctxIsOpen
    const setOpen = propOnOpenChange !== undefined ? propOnOpenChange : ctxOnOpenChange

    const [isCreating, setIsCreating] = useState(false)
    const [newPlaylistName, setNewPlaylistName] = useState("")
    const [isPending, startTransition] = useTransition()

    // Fetch playlists when dialog opens
    useEffect(() => {
        if (!isOpen) return

        if (!session?.user) {
            setIsFullScreen(false)
            setOpen(false)
            toast.error("Please login to use playlists")
            router.push("/auth/login")
            return
        }

        fetchPlaylists()
    }, [isOpen, session?.user, setOpen, router, fetchPlaylists])

    const handleCreatePlaylist = async () => {
        if (!newPlaylistName.trim()) return

        setIsCreating(true)
        const res = await ctxHandleCreatePlaylist(newPlaylistName.trim())
        setIsCreating(false)

        if (res.error) {
            toast.error(res.error)
        } else if (res.playlist) {
            toast.success("Playlist created!")
            setNewPlaylistName("")

            // If we have an item selected, auto-add it to the new playlist
            if (selectedItemIdForPlaylist) {
                handleAddItem(res.playlist.id)
            }
        }
    }

    const handleAddItem = (playlistId: string) => {
        if (!selectedItemIdForPlaylist) return

        startTransition(async () => {
            const res = await ctxHandleAddItemToPlaylist(playlistId, selectedItemIdForPlaylist, selectedItemTypeForPlaylist)
            if (res.error) {
                if (res.error.includes("already in playlist")) {
                    toast(`${selectedItemTypeForPlaylist === 'TRACK' ? 'Track' : 'Podcast'} is already in this playlist`)
                } else {
                    toast.error(res.error)
                }
            } else {
                toast.success("Added to playlist")
                setOpen(false)
            }
        })
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[#121212] border-white/10 text-white backdrop-blur-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold flex items-center gap-2 uppercase tracking-wider">
                        <ListPlus className="h-5 w-5 text-primary" />
                        Add to Playlist
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Choose a playlist or create a new one.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Create New Playlist */}
                    <div className="flex items-center gap-2 p-2 rounded-md bg-white/5 border border-white/5 group focus-within:border-primary/50 transition-all">
                        <Plus className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                        <Input
                            placeholder="New playlist name..."
                            value={newPlaylistName}
                            onChange={(e) => setNewPlaylistName(e.target.value)}
                            className="h-8 bg-transparent border-none focus-visible:ring-0 placeholder:text-gray-600 text-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleCreatePlaylist()
                            }}
                        />
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                            onClick={handleCreatePlaylist}
                            disabled={isCreating || !newPlaylistName.trim()}
                        >
                            {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                        </Button>
                    </div>

                    {/* Playlists List */}
                    <div className="max-h-[300px] overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                        {isPlaylistsLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                <span className="text-xs text-gray-500 uppercase tracking-widest animate-pulse">Loading playlists...</span>
                            </div>
                        ) : playlists.length === 0 ? (
                            <div className="text-center py-8 px-4 rounded-md border border-dashed border-white/5 bg-white/2">
                                <p className="text-sm text-gray-500 italic">No playlists found. Create your first one!</p>
                            </div>
                        ) : (
                            playlists.map((playlist) => (
                                <button
                                    key={playlist.id}
                                    className="w-full flex items-center justify-between p-3 rounded-md hover:bg-white/10 border border-transparent hover:border-white/10 transition-all group active:scale-[0.98]"
                                    onClick={() => handleAddItem(playlist.id)}
                                    disabled={isPending}
                                >
                                    <div className="flex flex-col items-start min-w-0">
                                        <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{playlist.name}</span>
                                        <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                                            {(playlist._count?.tracks || 0) + (playlist._count?.podcasts || 0)} items
                                        </span>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-black transition-all">
                                        <Plus className="h-4 w-4" />
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
