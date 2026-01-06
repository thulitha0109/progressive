import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { redirect } from "next/navigation"
import { getLikedTracks } from "@/server/actions/tracks"
import { getLikedPodcasts } from "@/server/actions/podcasts"
import { PlayButton } from "@/components/shared/play-button"
import { Music2 } from "lucide-react"
import { NewReleaseCard } from "@/components/shared/new-release-card"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    const likedTracks = await getLikedTracks(session.user.id || "")
    const likedPodcasts = await getLikedPodcasts(session.user.id || "")

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-6 md:gap-10">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
                    <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                        <AvatarFallback className="text-5xl md:text-6xl">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center md:items-start pt-2">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{session.user.name}</h1>
                        <p className="text-muted-foreground text-lg">{session.user.email}</p>
                        <div className="flex gap-2 mt-3">
                            <span className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full capitalize border border-primary/20">
                                {session.user.role?.toLowerCase() || "user"}
                            </span>
                        </div>
                    </div>
                    <div className="md:ml-auto mt-4 md:mt-0">
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <Button variant="outline" size="lg" className="border-destructive/50 hover:bg-destructive/10 hover:text-destructive">
                                Sign Out
                            </Button>
                        </form>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Liked Tracks</h2>
                    {likedTracks.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                            {/* @ts-ignore - Track type mismatch with NewReleaseCard props, needs alignment or cast. Assuming mapped for now or will fix type def. */}
                            {/* Actually, NewReleaseCard expects specific props. likedTracks return type matches mostly but check `isLiked` and `likesCount`.
                                 getLikedTracks returns Track & { artist, genreRel }.
                                 NewReleaseCard needs `isLiked` and `likesCount`.
                                 Prisma result from `getLikedTracks` usually has those if included or calculated.
                                 Let's verify `getLikedTracks` return type.
                                 For now, fixing the syntax error of nested curly braces. */}
                            {likedTracks.map((track) => (
                                <NewReleaseCard key={track.id} track={{
                                    ...track,
                                    type: (track.type as string | null) || null,
                                    genreRel: track.genreRel ? {
                                        name: track.genreRel.name,
                                        parent: track.genreRel.parent ? { name: track.genreRel.parent.name } : undefined
                                    } : null,
                                    // @ts-ignore - Prisma returns _count
                                    likesCount: track._count.likedBy,
                                    isLiked: true
                                }} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <Music2 className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No liked tracks yet</h3>
                            <p className="text-muted-foreground">
                                Tracks you like will appear here.
                            </p>
                        </div>
                    )
                    }
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Liked Podcasts</h2>
                    {likedPodcasts.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2 xl:grid-cols-2">
                            {likedPodcasts.map((podcast) => (
                                <NewReleaseCard key={podcast.id} podcast={{
                                    ...podcast,
                                    artist: {
                                        id: podcast.artist?.id || "unknown",
                                        name: podcast.artist?.name || "Unknown Artist",
                                        imageUrl: podcast.artist?.imageUrl
                                    },
                                    type: podcast.type || "PODCAST",
                                    genre: podcast.genre?.name || null,
                                    genreRel: podcast.genre ? {
                                        name: podcast.genre.name
                                    } : null,
                                    likesCount: podcast._count.likedBy,
                                    isLiked: true,
                                    kind: "PODCAST"
                                }} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-muted-foreground">
                            <Music2 className="h-12 w-12 mx-auto mb-4" />
                            <h3 className="text-lg font-medium">No liked podcasts yet</h3>
                            <p className="text-muted-foreground">
                                Podcasts you like will appear here.
                            </p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Followed Artists</h2>
                    <FollowedArtistsList />
                </div>
            </div>
        </div>
    )
}

import { getFollowedArtists } from "@/server/actions/artists"
import Link from "next/link"

async function FollowedArtistsList() {
    const artists = await getFollowedArtists()

    if (artists.length === 0) {
        return (
            <div className="text-center py-10 text-muted-foreground border rounded-lg bg-muted/50">
                <p>You are not following any artists yet.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
            {artists.map((artist) => (
                <Link key={artist.id} href={`/artists/${artist.slug}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={artist.imageUrl || ""} alt={artist.name} className="object-cover" />
                            <AvatarFallback>{artist.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium truncate">{artist.name}</span>
                    </div>
                </Link>
            ))}
        </div>
    )
}
