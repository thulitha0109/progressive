import Image from "next/image"
import { getPodcasts } from "@/server/actions/podcasts"
import { Card, CardContent } from "@/components/ui/card"
import { PlayButton } from "@/components/shared/play-button"
import { Music2 } from "lucide-react"

export default async function PodcastsPage() {
    const { podcasts } = await getPodcasts()

    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="flex flex-col gap-4 md:gap-8">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Podcasts</h1>
                    <p className="text-muted-foreground">
                        Listen to our latest podcast episodes and discussions.
                    </p>
                </div>

                {podcasts.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {podcasts.map((podcast) => (
                            <Card key={podcast.id} className="overflow-hidden p-0">
                                <div className="aspect-square relative bg-muted">
                                    {podcast.imageUrl ? (
                                        <Image
                                            src={podcast.imageUrl}
                                            alt={podcast.title}
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-muted-foreground">
                                            <Music2 className="h-12 w-12" />
                                        </div>
                                    )}
                                    <div className="absolute bottom-2 right-2">
                                        <PlayButton track={{ ...podcast, artist: { id: podcast.artist?.id || "", name: podcast.artist?.name || "Unknown Artist", imageUrl: podcast.artist?.imageUrl } }} />
                                    </div>
                                </div>
                                <CardContent className="p-4">
                                    <h3 className="font-semibold truncate">{podcast.title}</h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                        {podcast.artist?.name || "Unknown Artist"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                        {podcast.description}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 text-muted-foreground">
                        <Music2 className="h-12 w-12 mx-auto mb-4" />
                        <h3 className="text-lg font-medium">No podcasts yet</h3>
                        <p className="text-muted-foreground">
                            Check back later for new episodes.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
