"use client"

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { toggleLike, togglePodcastLike } from "@/server/actions/likes"
import { toggleFollowArtist } from "@/server/actions/social"
import { getUserPlaylists, createPlaylist, addTrackToPlaylist, removeTrackFromPlaylist, deletePlaylist, addPodcastToPlaylist, removePodcastFromPlaylist } from "@/server/actions/playlists"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { usePlayer } from "@/components/shared/player-context"

export interface LikeState {
    isLiked: boolean
    likesCount: number
}

export interface Playlist {
    id: string
    name: string
    description?: string | null
    updatedAt: Date | string
    _count: {
        tracks: number
        podcasts: number
    }
}

export interface UserActionsContextType {
    // Likes
    likeStates: Record<string, LikeState>
    initializeLikeState: (itemId: string, initialIsLiked: boolean, initialLikes: number) => void
    handleToggleLike: (itemId: string, type: "TRACK" | "PODCAST", isLoggedIn: boolean) => Promise<string | boolean>

    // Follows
    followStates: Record<string, boolean>
    initializeFollowState: (artistId: string, initialIsFollowing: boolean) => void
    handleToggleFollow: (artistId: string) => Promise<string | boolean>

    // Playlists
    playlists: Playlist[]
    isPlaylistDialogOpen: boolean
    setPlaylistDialogOpen: (open: boolean) => void
    selectedItemIdForPlaylist: string | null
    selectedItemTypeForPlaylist: "TRACK" | "PODCAST"
    setSelectedItemIdForPlaylist: (itemId: string | null) => void
    setSelectedItemTypeForPlaylist: (type: "TRACK" | "PODCAST") => void
    isPlaylistsLoading: boolean
    fetchPlaylists: () => Promise<void>
    openPlaylistDialog: (itemId: string, type: "TRACK" | "PODCAST") => void
    handleCreatePlaylist: (name: string, description?: string) => Promise<{ playlist?: any, error?: string }>
    handleAddItemToPlaylist: (playlistId: string, itemId: string, type: "TRACK" | "PODCAST") => Promise<{ success?: boolean, error?: string }>
    handleRemoveItemFromPlaylist: (playlistId: string, itemId: string, type: "TRACK" | "PODCAST") => Promise<void>
    handleDeletePlaylist: (playlistId: string) => Promise<void>
}

const UserActionsContext = createContext<UserActionsContextType | undefined>(undefined)

export function UserActionsProvider({ children }: { children: ReactNode }) {
    const [likeStates, setLikeStates] = useState<Record<string, LikeState>>({})
    const [followStates, setFollowStates] = useState<Record<string, boolean>>({})
    const [playlists, setPlaylists] = useState<Playlist[]>([])
    const [isPlaylistDialogOpen, setPlaylistDialogOpen] = useState(false)
    const [selectedItemIdForPlaylist, setSelectedItemIdForPlaylist] = useState<string | null>(null)
    const [selectedItemTypeForPlaylist, setSelectedItemTypeForPlaylist] = useState<"TRACK" | "PODCAST">("TRACK")
    const [isPlaylistsLoading, setIsPlaylistsLoading] = useState(false)
    const router = useRouter()
    const { setIsFullScreen } = usePlayer()

    const handleUnauthorized = useCallback(() => {
        setIsFullScreen(false)
        router.push("/auth/login")
        toast.error("Please login to continue")
    }, [router, setIsFullScreen])

    // Like Logic
    const initializeLikeState = useCallback((itemId: string, initialIsLiked: boolean, initialLikes: number) => {
        setLikeStates(prev => {
            if (prev[itemId] === undefined) {
                return { ...prev, [itemId]: { isLiked: initialIsLiked, likesCount: initialLikes } }
            }
            return prev
        })
    }, [])

    const handleToggleLike = useCallback(async (itemId: string, type: "TRACK" | "PODCAST", isLoggedIn: boolean) => {
        if (!isLoggedIn) {
            handleUnauthorized()
            return "Unauthorized"
        }

        const currentState = likeStates[itemId]
        if (!currentState) return "State not initialized"

        const newIsLiked = !currentState.isLiked
        const newLikesCount = currentState.likesCount + (newIsLiked ? 1 : -1)

        // Optimistic update
        setLikeStates(prev => ({
            ...prev,
            [itemId]: { isLiked: newIsLiked, likesCount: newLikesCount }
        }))

        try {
            const result = type === "TRACK" ? await toggleLike(itemId) : await togglePodcastLike(itemId)

            if (result.error) {
                // Revert
                setLikeStates(prev => ({
                    ...prev,
                    [itemId]: currentState
                }))
                return result.error
            }

            return true
        } catch (error: any) {
            // Revert
            setLikeStates(prev => ({
                ...prev,
                [itemId]: currentState
            }))
            return error.message || "Failed to toggle like"
        }
    }, [likeStates])

    // Follow Logic
    const initializeFollowState = useCallback((artistId: string, initialIsFollowing: boolean) => {
        setFollowStates(prev => {
            if (prev[artistId] === undefined) {
                return { ...prev, [artistId]: initialIsFollowing }
            }
            return prev
        })
    }, [])

    const handleToggleFollow = useCallback(async (artistId: string) => {
        const currentState = followStates[artistId] ?? false
        setFollowStates(prev => ({ ...prev, [artistId]: !currentState }))

        try {
            const result = await toggleFollowArtist(artistId)
            setFollowStates(prev => ({ ...prev, [artistId]: result.isFollowing }))
            toast.success(result.isFollowing ? "Following artist" : "Unfollowed artist")
            return true
        } catch (error: any) {
            setFollowStates(prev => ({ ...prev, [artistId]: currentState }))
            toast.error(error.message || "Failed to toggle follow")
            return error.message || "Failed to toggle follow"
        }
    }, [followStates])

    // Playlist Logic
    const fetchPlaylists = useCallback(async () => {
        setIsPlaylistsLoading(true)
        const result = await getUserPlaylists()
        setIsPlaylistsLoading(false)
        if (result.playlists) {
            setPlaylists(result.playlists as Playlist[])
        }
    }, [])

    const handleCreatePlaylist = useCallback(async (name: string, description?: string) => {
        const result = await createPlaylist(name, description)
        if (result.playlist) {
            toast.success("Playlist created")
            await fetchPlaylists()
        }
        return result
    }, [fetchPlaylists])

    const handleAddItemToPlaylist = useCallback(async (playlistId: string, itemId: string, type: "TRACK" | "PODCAST") => {
        const result = type === "TRACK"
            ? await addTrackToPlaylist(playlistId, itemId)
            : await addPodcastToPlaylist(playlistId, itemId)

        if (result.success) {
            await fetchPlaylists()
        }
        return result
    }, [fetchPlaylists])

    const openPlaylistDialog = useCallback((itemId: string, type: "TRACK" | "PODCAST", isLoggedIn?: boolean) => {
        if (isLoggedIn === false) {
            handleUnauthorized()
            return
        }
        setSelectedItemIdForPlaylist(itemId)
        setSelectedItemTypeForPlaylist(type)
        setPlaylistDialogOpen(true)
    }, [handleUnauthorized])

    const handleDeletePlaylist = useCallback(async (playlistId: string) => {
        const result = await deletePlaylist(playlistId)
        if (result.success) {
            toast.success("Playlist deleted")
            await fetchPlaylists()
        } else {
            toast.error(result.error || "Failed to delete playlist")
        }
    }, [fetchPlaylists])

    const handleRemoveItemFromPlaylist = useCallback(async (playlistId: string, itemId: string, type: "TRACK" | "PODCAST") => {
        const result = type === "TRACK"
            ? await removeTrackFromPlaylist(playlistId, itemId)
            : await removePodcastFromPlaylist(playlistId, itemId)

        if (result.success) {
            toast.success("Removed from playlist")
            await fetchPlaylists()
        } else {
            toast.error(result.error || "Failed to remove item")
        }
    }, [fetchPlaylists])

    return (
        <UserActionsContext.Provider value={{
            likeStates,
            initializeLikeState,
            handleToggleLike,
            followStates,
            initializeFollowState,
            handleToggleFollow,
            playlists,
            isPlaylistDialogOpen,
            setPlaylistDialogOpen,
            selectedItemIdForPlaylist,
            selectedItemTypeForPlaylist,
            setSelectedItemIdForPlaylist,
            setSelectedItemTypeForPlaylist,
            isPlaylistsLoading,
            fetchPlaylists,
            openPlaylistDialog,
            handleCreatePlaylist,
            handleAddItemToPlaylist,
            handleRemoveItemFromPlaylist,
            handleDeletePlaylist,
        }}>
            {children}
        </UserActionsContext.Provider>
    )
}

export function useUserActions() {
    const context = useContext(UserActionsContext)
    if (context === undefined) {
        throw new Error("useUserActions must be used within a UserActionsProvider")
    }
    return context
}
