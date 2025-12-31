import { auth, signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { redirect } from "next/navigation"
import { getLikedTracks } from "@/server/actions/tracks"
import { PlayButton } from "@/components/shared/play-button"
import { Music2 } from "lucide-react"

export default async function ProfilePage() {
    const session = await auth()

    if (!session?.user) {
        redirect("/auth/login")
    }

    const likedTracks = await getLikedTracks(session.user.id || "")

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-4 md:gap-8">
                <div className="flex items-center gap-6">
                    <Avatar className="h-24 w-24">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
                        <AvatarFallback className="text-4xl">
                            {session.user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{session.user.name}</h1>
                        <p className="text-muted-foreground">{session.user.email}</p>
                        <div className="flex gap-2 mt-2">
                            <span className="text-xs bg-secondary px-2 py-1 rounded-full capitalize">
                                {session.user.role?.toLowerCase() || "user"}
                            </span>
                        </div>
                    </div>
                    <div className="ml-auto">
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/" })
                            }}
                        >
                            <Button variant="outline">Sign Out</Button>
                        </form>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Liked Tracks</h2>
                    {likedTracks.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {likedTracks.map((track) => (
                                <Card key={track.id} className="overflow-hidden">
                                    <div className="aspect-square relative bg-muted">
                                        {track.imageUrl ? (
                                            <img
                                                src={track.imageUrl}
                                                alt={track.title}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-muted-foreground">
                                                <Music2 className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute bottom-2 right-2">
                                            <PlayButton track={track} />
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate">{track.title}</h3>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {track.artist.name}
                                        </p>
                                    </CardContent>
                                </Card>
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
