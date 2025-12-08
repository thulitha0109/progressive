"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { restoreTrack, permanentDeleteTrack } from "@/server/actions/tracks"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { RotateCcw, Trash2, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface Track {
    id: string
    title: string
    artist: {
        name: string
    }
    deletedAt: Date | null
}

interface TrashManagerProps {
    tracks: Track[]
}

export function TrashManager({ tracks }: TrashManagerProps) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleRestore = async (id: string) => {
        setIsPending(true)
        try {
            await restoreTrack(id)
            router.refresh()
        } catch (error) {
            console.error("Error restoring track:", error)
            alert("Failed to restore track")
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this track? This action cannot be undone.")) return

        setIsPending(true)
        try {
            await permanentDeleteTrack(id)
            router.refresh()
        } catch (error) {
            console.error("Error deleting track:", error)
            alert("Failed to delete track")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/tracks" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Tracks
                    </Link>
                </Button>
                <h2 className="text-2xl font-bold tracking-tight">Trash</h2>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Artist</TableHead>
                            <TableHead>Deleted At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tracks.map((track) => (
                            <TableRow key={track.id}>
                                <TableCell className="font-medium">{track.title}</TableCell>
                                <TableCell>{track.artist.name}</TableCell>
                                <TableCell>
                                    {track.deletedAt ? new Date(track.deletedAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRestore(track.id)}
                                            title="Restore"
                                            disabled={isPending}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(track.id)}
                                            title="Permanently Delete"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {tracks.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                                    Trash is empty.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
