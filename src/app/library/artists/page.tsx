"use client"

import { useUserActions } from "@/contexts/user-actions-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getFollowedArtists } from "@/server/actions/artists"

interface Artist {
    id: string;
    name: string;
    imageUrl: string | null;
    slug: string;
}

export default function LibraryArtistsPage() {
    const [artists, setArtists] = useState<Artist[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchArtists() {
            try {
                const data = await getFollowedArtists()
                setArtists(data as any)
            } finally {
                setIsLoading(false)
            }
        }
        fetchArtists()
    }, [])

    return (
        <div className="container py-8 px-4 md:px-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Followed Artists</h1>
                <p className="text-muted-foreground mt-1">Artists you follow for new releases and updates.</p>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="animate-pulse flex flex-col items-center gap-3">
                            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full bg-muted" />
                            <div className="h-4 w-20 bg-muted rounded" />
                        </div>
                    ))}
                </div>
            ) : artists.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl bg-muted/20 border-dashed">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <Users className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold">No artists followed yet</h2>
                    <p className="text-muted-foreground max-w-sm mt-1">
                        Follow your favorite artists to stay updated on their latest releases.
                    </p>
                    <Link href="/artists" className="mt-6 text-primary hover:underline font-medium">
                        Explore Artists
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-8">
                    {artists.map((artist) => (
                        <Link key={artist.id} href={`/artists/${artist.slug}`} className="group flex flex-col items-center gap-4">
                            <div className="relative">
                                <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-2 border-white/5 transition-all duration-300 group-hover:border-primary/50 group-hover:scale-105 shadow-xl">
                                    <AvatarImage src={artist.imageUrl || ""} alt={artist.name} className="object-cover" />
                                    <AvatarFallback className="text-2xl">{artist.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="absolute inset-0 rounded-full bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <span className="font-semibold text-center group-hover:text-primary transition-colors line-clamp-1">{artist.name}</span>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
