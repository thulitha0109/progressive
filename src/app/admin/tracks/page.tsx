import Link from "next/link"
import { getTracks, deleteTrack } from "@/server/actions/tracks"
import { Button } from "@/components/ui/button"
import { Plus, Play, Edit, Trash } from "lucide-react"
import { FeatureButton } from "./_components/feature-button"
import { Pagination } from "@/components/ui/pagination"
import { cn } from "@/lib/utils"
import { ClientDate } from "@/components/shared/client-date"

interface TracksPageProps {
    searchParams: Promise<{ page?: string; status?: 'published' | 'upcoming' | 'all' }>
}

export default async function TracksPage({ searchParams }: TracksPageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const status = params.status || 'published'
    const { tracks, totalCount, totalPages } = await getTracks(currentPage, 10, undefined, status)

    return (
        <div>
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Tracks</h1>
                    <div className="flex gap-2">
                        <Button variant="outline" asChild>
                            <Link href="/admin/tracks/trash">
                                <Trash className="mr-2 h-4 w-4" />
                                Trash
                            </Link>
                        </Button>
                        <Button asChild>
                            <Link href="/admin/tracks/new">
                                <Plus className="mr-2 h-4 w-4" />
                                Add Track
                            </Link>
                        </Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={!params.status || params.status === 'published' ? "secondary" : "ghost"} asChild>
                        <Link href="/admin/tracks">Published</Link>
                    </Button>
                    <Button variant={params.status === 'upcoming' ? "secondary" : "ghost"} asChild>
                        <Link href="/admin/tracks?status=upcoming">Upcoming</Link>
                    </Button>
                    <Button variant={params.status === 'all' ? "secondary" : "ghost"} asChild>
                        <Link href="/admin/tracks?status=all">All</Link>
                    </Button>
                </div>
            </div>

            <div className="rounded-md border">
                <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 font-medium text-sm">
                    <div className="col-span-4">Title</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-3">Artist</div>
                    <div className="col-span-2">Scheduled For</div>
                    <div className="col-span-1 text-right">Actions</div>
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
                            <div className="col-span-2">
                                {track.type && (
                                    <span className={cn(
                                        "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border",
                                        track.type === "Remix" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                                        track.type === "Bootleg" && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                                        track.type === "Mashup" && "bg-pink-500/10 text-pink-500 border-pink-500/20",
                                        !["Remix", "Bootleg", "Mashup"].includes(track.type) && "bg-primary/10 text-primary border-primary/20"
                                    )}>
                                        {track.type}
                                    </span>
                                )}
                                {!track.type && (
                                    <span className="text-xs text-muted-foreground">-</span>
                                )}
                            </div>
                            <div className="col-span-3 text-muted-foreground">{track.artist.name}</div>
                            <div className="col-span-2 text-muted-foreground">
                                <ClientDate date={track.scheduledFor} />
                            </div>
                            <div className="col-span-1 text-right flex justify-end gap-1">
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

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    basePath="/admin/tracks"
                    totalItems={totalCount}
                    itemsPerPage={10}
                />
            </div>
        </div>
    )
}
