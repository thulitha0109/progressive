import Link from "next/link"
import { getTracks, deleteTrack } from "@/app/actions/tracks"
import { Button } from "@/components/ui/button"
import { Plus, Play, Edit, Trash } from "lucide-react"
import { FeatureButton } from "./_components/feature-button"
import { Pagination } from "@/components/ui/pagination"

interface TracksPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function TracksPage({ searchParams }: TracksPageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const { tracks, totalCount, totalPages } = await getTracks(currentPage)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
                <Button asChild>
                    <Link href="/admin/tracks/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Track
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-3">Artist</div>
                    <div className="col-span-3">Scheduled For</div>
                    <div className="col-span-2 text-right">Actions</div>
                </div>
                <div className="divide-y">
                    {tracks.map((track) => (
                        <div key={track.id} className="grid grid-cols-12 gap-4 p-4 items-center text-sm">
                            <div className="col-span-4 font-medium flex items-center gap-2">
                                <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                                    <Play className="h-4 w-4" />
                                </div>
                                {track.title}
                            </div>
                            <div className="col-span-3 text-muted-foreground">{track.artist.name}</div>
                            <div className="col-span-3 text-muted-foreground">
                                {new Date(track.scheduledFor).toLocaleString()}
                            </div>
                            <div className="col-span-2 text-right flex justify-end gap-2">
                                <FeatureButton trackId={track.id} isFeatured={track.isFeatured} />
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href={`/admin/tracks/${track.id}/edit`}>
                                        <Edit className="h-4 w-4" />
                                    </Link>
                                </Button>
                                <form action={deleteTrack.bind(null, track.id)}>
                                    <Button variant="ghost" size="icon" type="submit">
                                        <Trash className="h-4 w-4 text-destructive" />
                                    </Button>
                                </form>
                            </div>
                        </div>
                    ))}
                    {tracks.length === 0 && (
                        <div className="p-8 text-center text-muted-foreground">
                            No tracks found. Upload one to get started.
                        </div>
                    )}
                </div>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/admin/tracks"
                totalItems={totalCount}
                itemsPerPage={10}
            />
        </div>
    )
}
