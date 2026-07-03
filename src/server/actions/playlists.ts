"use server"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getUserPlaylists() {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const playlists = await prisma.playlist.findMany({
            where: { userId: session.user.id },
            include: {
                tracks: { select: { id: true } },
                podcasts: { select: { id: true } }
            },
            orderBy: { updatedAt: 'desc' }
        })

        const playlistsWithCount = playlists.map(p => ({
            ...p,
            _count: {
                tracks: p.tracks.length,
                podcasts: p.podcasts.length
            }
        }))

        return { playlists: playlistsWithCount }
    } catch (error) {
        console.error("Error fetching playlists:", error)
        return { error: "Failed to fetch playlists" }
    }
}

export async function createPlaylist(name: string, description?: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const playlist = await prisma.playlist.create({
            data: {
                name,
                description,
                userId: session.user.id,
            }
        })
        revalidatePath("/playlists")
        return { playlist }
    } catch (error) {
        console.error("Error creating playlist:", error)
        return { error: "Failed to create playlist" }
    }
}

export async function addTrackToPlaylist(playlistId: string, trackId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        // Verify ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        })
        if (!playlist || playlist.userId !== session.user.id) {
            return { error: "Unauthorized or not found" }
        }

        // Add track
        await prisma.playlistTrack.create({
            data: {
                playlistId,
                trackId
            }
        })

        // Update playlist modified time
        await prisma.playlist.update({
            where: { id: playlistId },
            data: { updatedAt: new Date() }
        })

        return { success: true }
    } catch (error: unknown) {
        if ((error as { code?: string })?.code === 'P2002') {
            return { error: "Track already in playlist" }
        }
        console.error("Error adding to playlist:", error)
        return { error: "Failed to add track to playlist" }
    }
}

export async function removeTrackFromPlaylist(playlistId: string, trackId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        // Verify ownership
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        })
        if (!playlist || playlist.userId !== session.user.id) {
            return { error: "Unauthorized or not found" }
        }

        // Remove track
        await prisma.playlistTrack.delete({
            where: {
                playlistId_trackId: {
                    playlistId,
                    trackId
                }
            }
        })

        // Update playlist modified time
        await prisma.playlist.update({
            where: { id: playlistId },
            data: { updatedAt: new Date() }
        })

        return { success: true }
    } catch (error) {
        console.error("Error removing from playlist:", error)
        return { error: "Failed to remove track" }
    }
}

export async function addPodcastToPlaylist(playlistId: string, podcastId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        })
        if (!playlist || playlist.userId !== session.user.id) {
            return { error: "Unauthorized or not found" }
        }

        await prisma.playlistPodcast.create({
            data: {
                playlistId,
                podcastId
            }
        })

        await prisma.playlist.update({
            where: { id: playlistId },
            data: { updatedAt: new Date() }
        })

        return { success: true }
    } catch (error: unknown) {
        if ((error as { code?: string })?.code === 'P2002') {
            return { error: "Podcast already in playlist" }
        }
        console.error("Error adding podcast to playlist:", error)
        return { error: "Failed to add podcast to playlist" }
    }
}

export async function removePodcastFromPlaylist(playlistId: string, podcastId: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const playlist = await prisma.playlist.findUnique({
            where: { id: playlistId }
        })
        if (!playlist || playlist.userId !== session.user.id) {
            return { error: "Unauthorized or not found" }
        }

        await prisma.playlistPodcast.delete({
            where: {
                playlistId_podcastId: {
                    playlistId,
                    podcastId
                }
            }
        })

        await prisma.playlist.update({
            where: { id: playlistId },
            data: { updatedAt: new Date() }
        })

        return { success: true }
    } catch (error) {
        console.error("Error removing podcast from playlist:", error)
        return { error: "Failed to remove podcast" }
    }
}
export async function getPlaylistById(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id,
                userId: session.user.id
            },
            include: {
                tracks: {
                    include: {
                        track: {
                            include: {
                                artist: true,
                                genreRel: {
                                    include: {
                                        parent: true
                                    }
                                },
                                _count: {
                                    select: { likedBy: true }
                                }
                            }
                        }
                    }
                },
                podcasts: {
                    include: {
                        podcast: {
                            include: {
                                artist: true,
                                genre: true,
                                _count: {
                                    select: { likedBy: true }
                                }
                            }
                        }
                    }
                }
            }
        })
        return { playlist }
    } catch (error) {
        console.error("Error fetching playlist:", error)
        return { error: "Failed to fetch playlist" }
    }
}
export async function deletePlaylist(id: string) {
    const session = await auth()
    if (!session?.user?.id) {
        return { error: "Unauthorized" }
    }

    try {
        await prisma.playlist.delete({
            where: {
                id,
                userId: session.user.id
            }
        })
        revalidatePath("/library/playlists")
        return { success: true }
    } catch (error) {
        console.error("Error deleting playlist:", error)
        return { error: "Failed to delete playlist" }
    }
}
