import Link from "next/link"
import { getHomeData } from "@/app/actions/home"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlayButton } from "@/components/play-button"
import { LikeButton } from "@/components/like-button"
import { Calendar, User } from "lucide-react"
import { FeaturedSection } from "@/components/featured-section"
import { NewReleaseCard } from "@/components/new-release-card"
import { ArtistCarousel } from "@/components/artist-carousel"

export default async function HomePage() {
  const { upcomingTracks, publishedTracks, featuredTrack, artists } = await getHomeData()

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Featured Section (Replaces Hero) */}
      {featuredTrack ? (
        <FeaturedSection track={featuredTrack} />
      ) : publishedTracks.length > 0 ? (
        <FeaturedSection track={publishedTracks[0]} />
      ) : (
        <section className="relative h-[400px] w-full overflow-hidden bg-primary/5">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
          <div className="container relative flex h-full flex-col justify-center px-4 md:px-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Discover the Future of Sound
            </h1>
            <p className="mt-4 max-w-[700px] text-muted-foreground md:text-xl">
              Exclusive tracks, upcoming releases, and the artists behind them.
            </p>
          </div>
        </section>
      )}

      <div className="px-4 md:px-6 py-12 space-y-16">
        {/* Upcoming Tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Releases</h2>
            <Link href="/tracks/upcoming" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {upcomingTracks.map((track) => (
              <Card key={track.id} className="overflow-hidden border-none bg-secondary/20">
                <div className="aspect-square bg-muted relative flex items-center justify-center">
                  {track.artist.imageUrl ? (
                    <img
                      src={track.artist.imageUrl}
                      alt={track.artist.name}
                      className="h-full w-full object-cover opacity-50"
                    />
                  ) : (
                    <User className="h-12 w-12 text-muted-foreground" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="rounded-full bg-background/90 px-3 py-1 text-xs font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(track.scheduledFor).toLocaleDateString()}
                    </div>
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
            {upcomingTracks.length === 0 && (
              <p className="text-muted-foreground col-span-full">No upcoming tracks scheduled.</p>
            )}
          </div>
        </section>

        {/* Published Tracks (New Releases) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">New Releases</h2>
            <Link href="/tracks" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {publishedTracks.map((track) => (
              <NewReleaseCard key={track.id} track={track} />
            ))}
            {publishedTracks.length === 0 && (
              <p className="text-muted-foreground">No tracks published yet.</p>
            )}
          </div>
        </section>

        {/* Artists */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Popular Artists</h2>
            <Link href="/artists" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <ArtistCarousel artists={artists} />
        </section>
      </div>
    </div>
  )
}
