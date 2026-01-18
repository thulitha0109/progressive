import { globalSearch } from "@/server/actions/search"
import Image from "next/image"
import Link from "next/link"
import { PlayButton } from "@/components/shared/play-button"
import { Calendar, User, ShoppingBag, Radio } from "lucide-react"

export const dynamic = 'force-dynamic'

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>
}) {
    const { q } = await searchParams
    const query = q || ""

    // Fetch more results for the dedicated search page
    const results = query ? await globalSearch(query, 10) : []

    // Group results by type
    const artists = results.filter(r => r.type === 'artist')
    const tracks = results.filter(r => r.type === 'track')
    const podcasts = results.filter(r => r.type === 'podcast')
    const events = results.filter(r => r.type === 'event')
    const shop = results.filter(r => r.type === 'shop' || r.type === 'product')
    const blog = results.filter(r => r.type === 'blog')

    return (
        <div className="container py-12 px-4 md:px-8 min-h-screen max-w-[1400px]">
            <div className="flex flex-col gap-8 mb-12">
                <h1 className="text-4xl font-bold tracking-tight">Search</h1>
                <form action="/search" method="get" className="flex gap-2 max-w-2xl">
                    <input
                        type="text"
                        name="q"
                        defaultValue={query}
                        placeholder="Search for artists, tracks, podcasts..."
                        className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        autoFocus
                    />
                    <button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 rounded-md font-medium">
                        Search
                    </button>
                </form>
            </div>

            {query && results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-md border-muted">
                    <p className="text-xl font-medium text-muted-foreground">No results found for "{query}"</p>
                    <p className="text-sm text-muted-foreground/60 mt-2">Try different keywords or check spelling.</p>
                </div>
            ) : null}

            {!query && (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-md border-muted">
                    <p className="text-xl font-medium text-muted-foreground">Type something to start searching</p>
                </div>
            )}

            <div className="space-y-16">
                {/* Artists */}
                {artists.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <User className="h-6 w-6" /> Artists
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                            {artists.map((artist) => (
                                <Link key={artist.id} href={artist.url} className="group flex flex-col items-center text-center gap-3">
                                    <div className="relative w-full aspect-square rounded-full overflow-hidden border border-white/10 group-hover:border-primary/50 transition-colors">
                                        {artist.image ? (
                                            <Image src={artist.image} alt={artist.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <User className="h-10 w-10 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-medium group-hover:text-primary transition-colors">{artist.title}</span>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Tracks */}
                {tracks.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                            </svg>
                            Tracks
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {tracks.map((track) => (
                                <div key={track.id} className="flex items-center gap-4 p-3 rounded-lg bg-card/40 border border-white/5 hover:bg-card/60 transition-colors group">
                                    <div className="relative w-16 h-16 rounded overflow-hidden shrink-0">
                                        {track.image ? (
                                            <Image src={track.image} alt={track.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-muted" />
                                        )}
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                            <PlayButton
                                                track={{
                                                    id: track.id,
                                                    title: track.title,
                                                    audioUrl: track.audioUrl || "",
                                                    imageUrl: track.image,
                                                    artist: { id: "unknown", name: track.subtitle || "" },
                                                    kind: "TRACK"
                                                }}
                                                variant="icon"
                                            />
                                        </div>
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Link href={track.url} className="font-medium truncate block hover:text-primary transition-colors">
                                            {track.title}
                                        </Link>
                                        <p className="text-sm text-muted-foreground truncate">{track.subtitle}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Podcasts */}
                {podcasts.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Radio className="h-6 w-6" /> Podcasts
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {podcasts.map((podcast) => (
                                <Link key={podcast.id} href={podcast.url} className="group block">
                                    <div className="relative aspect-video rounded-lg overflow-hidden mb-3 border border-white/5">
                                        {podcast.image ? (
                                            <Image src={podcast.image} alt={podcast.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full bg-muted" />
                                        )}
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium">Listen Now</span>
                                        </div>
                                    </div>
                                    <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{podcast.title}</h3>
                                    <p className="text-sm text-muted-foreground">{podcast.subtitle}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Events */}
                {events.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Calendar className="h-6 w-6" /> Events
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {events.map((event) => (
                                <Link key={event.id} href={event.url} className="group block bg-card/40 rounded-lg overflow-hidden border border-white/5 hover:border-primary/50 transition-colors">
                                    <div className="relative aspect-[4/3]">
                                        {event.image ? (
                                            <Image src={event.image} alt={event.title} fill className="object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-muted" />
                                        )}
                                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-md">
                                            {event.subtitle}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{event.title}</h3>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}

                {/* Shop */}
                {shop.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <ShoppingBag className="h-6 w-6" /> Shop
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {shop.map((item) => (
                                <Link key={item.id} href={item.url} className="group block">
                                    <div className="relative aspect-square rounded-lg overflow-hidden mb-3 border border-white/5 bg-white/5">
                                        {item.image ? (
                                            <Image src={item.image} alt={item.title} fill className="object-cover transition-transform group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">{item.title}</h3>
                                    <p className="text-sm text-muted-foreground">{item.subtitle}</p>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    )
}
