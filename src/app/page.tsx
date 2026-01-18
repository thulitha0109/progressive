import Link from "next/link"
import Image from "next/image"
import { getHomeData } from "@/server/actions/home"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PlayButton } from "@/components/shared/play-button"
import { LikeButton } from "@/components/shared/like-button"
import { Calendar, User } from "lucide-react"
import { FeaturedSection } from "@/components/shared/featured-section"
import { NewReleaseCard } from "@/components/shared/new-release-card"
import { ArtistCarousel } from "@/components/shared/artist-carousel"
import { UpcomingCarousel } from "@/components/shared/upcoming-carousel"
import { NewReleasesCarousel } from "@/components/home/new-releases-carousel"
import { NewPodcastsCarousel } from "@/components/home/new-podcasts-carousel"

import { ArtistSort } from "@/components/artist/artist-sort"

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ sort?: string }>
}) {
  const params = await searchParams
  const sort = (params.sort as any) || "popular"
  const { upcomingTracks, publishedTracks, newPodcasts, featuredItem, artists, blogPosts } = await getHomeData(sort)

  // Fallback to latest published track if no featured item
  const displayItem = featuredItem || (publishedTracks.length > 0 ? { ...publishedTracks[0], type: "TRACK" as const } : null)

  return (
    <div className="min-h-screen bg-background pb-24 overflow-x-hidden">
      {/* Featured Section (Replaces Hero) */}
      {displayItem ? (
        <FeaturedSection item={displayItem} />
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

      <div className="px-4 md:px-6 py-16 md:py-24 space-y-24 md:space-y-32">
        {/* Upcoming Tracks */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Upcoming Releases</h2>
            <Link href="/tracks/upcoming" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>
          <div className="block">
            <UpcomingCarousel tracks={upcomingTracks} />
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

          {publishedTracks.length > 0 ? (
            <NewReleasesCarousel tracks={publishedTracks} />
          ) : (
            <p className="text-muted-foreground">No tracks published yet.</p>
          )}
        </section>

        {/* Published Podcasts (New Podcasts) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">New Podcasts</h2>
            <Link href="/podcasts" className="text-sm text-primary hover:underline">
              View All
            </Link>
          </div>

          {newPodcasts && newPodcasts.length > 0 ? (
            <NewPodcastsCarousel podcasts={newPodcasts} />
          ) : (
            <p className="text-muted-foreground">No podcasts published yet.</p>
          )}
        </section>

        {/* Artists */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Popular Artists</h2>
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
              <ArtistSort />
              <Link href="/artists" className="text-sm text-primary hover:underline whitespace-nowrap">
                View All
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {artists.slice(0, 6).map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.slug}`} className="group">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative h-32 w-32 md:h-40 md:w-40 overflow-hidden rounded-full bg-muted transition-transform group-hover:scale-105 shadow-md">
                    {artist.imageUrl ? (
                      <Image
                        src={artist.imageUrl}
                        alt={artist.name}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 640px) 128px, 160px"
                      />
                    ) : (
                      <User className="h-12 w-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="text-center">
                    <h3 className="font-medium truncate max-w-[120px]">{artist.name}</h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            {/* <Button variant="outline" asChild>
              <Link href="/artists">View All Artists</Link>
            </Button> */}
          </div>
        </section>

        {/* Blog Section */}
        {blogPosts && blogPosts.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight">Latest from the Blog</h2>
              <Link href="/blog" className="text-sm text-primary hover:underline">
                View All
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                  <Card className="overflow-hidden border-none bg-secondary/20 hover:bg-secondary/30 transition-colors h-full p-0">
                    <div className="aspect-video bg-muted relative overflow-hidden">
                      {post.coverImage ? (
                        <Image
                          src={post.coverImage}
                          alt={post.title}
                          fill
                          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-secondary">
                          <span className="text-muted-foreground text-sm">No Image</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.excerpt || post.content.substring(0, 100)}...
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
