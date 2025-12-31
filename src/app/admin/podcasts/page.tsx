import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash } from "lucide-react"
import { getPodcasts, deletePodcast } from "@/server/actions/podcasts"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Pagination } from "@/components/ui/pagination"

interface PodcastsPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function AdminPodcastsPage({ searchParams }: PodcastsPageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const { podcasts, totalCount, totalPages } = await getPodcasts(currentPage)

    return (
        <div className="container py-10">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Podcasts</h1>
                <Link href="/admin/podcasts/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Podcast
                    </Button>
                </Link>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Artist</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {podcasts.map((podcast) => (
                            <TableRow key={podcast.id}>
                                <TableCell className="font-medium">{podcast.title}</TableCell>
                                <TableCell>{podcast.artist?.name || "-"}</TableCell>
                                <TableCell>
                                    {new Date(podcast.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/admin/podcasts/${podcast.id}/edit`}>
                                            <Button variant="ghost" size="icon">
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </Link>
                                        <form
                                            action={async () => {
                                                "use server"
                                                await deletePodcast(podcast.id)
                                            }}
                                        >
                                            <Button variant="ghost" size="icon" className="text-destructive">
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {podcasts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    No podcasts found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/admin/podcasts"
                totalItems={totalCount}
                itemsPerPage={10}
            />
        </div>
    )
}
