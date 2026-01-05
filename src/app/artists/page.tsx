import Image from "next/image"
import Link from "next/link"
import { getArtists } from "@/server/actions/artists"
import { User } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { ArtistSearch } from "@/components/artist/artist-search"
import { ArtistSort } from "@/components/artist/artist-sort"
import { Pagination } from "@/components/shared/pagination"

export default async function ArtistsPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const page = Number(params.page) || 1
    const search = params.search as string
    const sort = (params.sort as any) || "newest"

    const { artists, totalPages, currentPage } = await getArtists(page, 12, search, sort)

    return (
        <div className="container py-10 px-4 md:px-8 animate-enter-fade-in">
            <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Artists</h1>
                        <p className="text-muted-foreground">
                            Meet the talent behind the music.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <ArtistSearch />
                        <ArtistSort />
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {artists.map((artist) => (
                        <Link key={artist.id} href={`/artists/${artist.slug}`}>
                            <Card className="overflow-hidden hover:bg-accent/50 transition-colors h-full p-0 border-0 group">
                                <div className="aspect-square relative bg-muted flex items-center justify-center overflow-hidden">
                                    {artist.imageUrl ? (
                                        <Image
                                            src={artist.imageUrl}
                                            alt={artist.name}
                                            fill
                                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                        />
                                    ) : (
                                        <User className="h-16 w-16 text-muted-foreground" />
                                    )}
                                </div>
                                <CardContent className="p-6 pt-4">
                                    <h3 className="font-bold text-xl mb-2">{artist.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {artist.bio}
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                    {artists.length === 0 && (
                        <div className="col-span-full text-center py-20 text-muted-foreground">
                            No artists found.
                        </div>
                    )}
                </div>

                <Pagination totalPages={totalPages} currentPage={currentPage} />
            </div>
        </div>
    )
}
