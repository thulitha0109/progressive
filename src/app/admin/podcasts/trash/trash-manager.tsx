"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { restorePodcast, permanentDeletePodcast } from "@/server/actions/podcasts"
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

interface Podcast {
    id: string
    title: string
    artist?: {
        name: string
    } | null
    deletedAt: Date | null
}

interface TrashManagerProps {
    podcasts: Podcast[]
}

export function TrashManager({ podcasts }: TrashManagerProps) {
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleRestore = async (id: string) => {
        setIsPending(true)
        try {
            await restorePodcast(id)
            router.refresh()
        } catch (error) {
            console.error("Error restoring podcast:", error)
            alert("Failed to restore podcast")
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this podcast? This action cannot be undone.")) return

        setIsPending(true)
        try {
            await permanentDeletePodcast(id)
            router.refresh()
        } catch (error) {
            console.error("Error deleting podcast:", error)
            alert("Failed to delete podcast")
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <Button variant="ghost" asChild className="pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/podcasts" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Podcasts
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
                        {podcasts.map((podcast) => (
                            <TableRow key={podcast.id}>
                                <TableCell className="font-medium">{podcast.title}</TableCell>
                                <TableCell>{podcast.artist?.name || "-"}</TableCell>
                                <TableCell>
                                    {podcast.deletedAt ? new Date(podcast.deletedAt).toLocaleDateString() : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRestore(podcast.id)}
                                            title="Restore"
                                            disabled={isPending}
                                        >
                                            <RotateCcw className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(podcast.id)}
                                            title="Permanently Delete"
                                            disabled={isPending}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {podcasts.length === 0 && (
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
