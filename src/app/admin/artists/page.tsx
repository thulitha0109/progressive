import Link from "next/link"
import { getArtists } from "@/server/actions/artists"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ArtistCard } from "./_components/artist-card"
import { Pagination } from "@/components/ui/pagination"

interface ArtistsPageProps {
    searchParams: Promise<{ page?: string }>
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const { artists, totalCount, totalPages } = await getArtists(currentPage)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
                <Button asChild>
                    <Link href="/admin/artists/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Artist
                    </Link>
                </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {artists.map((artist) => (
                    <ArtistCard key={artist.id} artist={artist} />
                ))}
                {artists.length === 0 && (
                    <div className="col-span-full text-center text-muted-foreground py-10">
                        No artists found. Create one to get started.
                    </div>
                )}
            </div>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/admin/artists"
                totalItems={totalCount}
                itemsPerPage={10}
            />
        </div>
    )
}
