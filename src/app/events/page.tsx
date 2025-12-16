import { prisma } from "@/lib/prisma"
import Image from "next/image"
import Link from "next/link"
import { Calendar, MapPin, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { EventsView } from "@/components/events/events-view"

export const revalidate = 60 // Revalidate every minute

export default async function EventsPage() {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // Parallel fetching for performance
    const [todayEvents, upcomingEvents, pastEvents] = await Promise.all([
        // Today
        prisma.event.findMany({
            where: {
                date: {
                    gte: startOfToday,
                    lt: endOfToday
                }
            },
            include: { tickets: true },
            orderBy: { date: "asc" }
        }),
        // Upcoming (Tomorrow onwards)
        prisma.event.findMany({
            where: {
                date: { gte: endOfToday }
            },
            include: { tickets: true },
            orderBy: { date: "asc" }
        }),
        // Past
        prisma.event.findMany({
            where: {
                date: { lt: startOfToday }
            },
            include: { tickets: true },
            orderBy: { date: "desc" },
            take: 20 // Limit past events
        })
    ])

    // Collect all unique locations
    const allLocations = Array.from(new Set([
        ...todayEvents.map(e => e.location),
        ...upcomingEvents.map(e => e.location),
        ...pastEvents.map(e => e.location)
    ])).sort()

    // Determine Featured Event (Priority: Today -> Upcoming)
    const featuredEvent = todayEvents.find(e => e.isFeatured) ||
        upcomingEvents.find(e => e.isFeatured) ||
        todayEvents[0] ||
        upcomingEvents[0]

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section - Standardized Blurry Design */}
            <div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden bg-background">
                {featuredEvent ? (
                    <>
                        <div className="absolute inset-0 z-0">
                            <Image
                                src={featuredEvent.coverImage || "/placeholder-event.jpg"}
                                alt={featuredEvent.title}
                                fill
                                className="object-cover opacity-40 blur-xl scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-transparent" />
                        </div>

                        <div className="absolute bottom-0 left-0 w-full z-20 container mx-auto px-4 pb-12 md:pb-24 flex flex-col justify-end h-full">
                            <div className="max-w-4xl space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                                <Badge className="w-fit mb-4 bg-primary/20 text-primary border-primary/50 hover:bg-primary/30 backdrop-blur-md px-4 py-1.5 text-sm uppercase tracking-wider">
                                    {new Date(featuredEvent.date) < now ? "Past Featured Event" : "Featured Event"}
                                </Badge>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground leading-[0.9] text-shadow-sm">
                                    {featuredEvent.title}
                                </h1>
                                <div className="flex flex-wrap gap-6 text-muted-foreground md:text-xl font-medium">
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
                                        <Calendar className="h-5 w-5 text-primary" />
                                        <span>
                                            {new Date(featuredEvent.date).toLocaleDateString("en-US", {
                                                weekday: "long",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
                                        <MapPin className="h-5 w-5 text-primary" />
                                        <span>{featuredEvent.venue}, {featuredEvent.location}</span>
                                    </div>
                                </div>
                                <div className="pt-4">
                                    <Button size="lg" className="font-bold text-lg h-14 px-10 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all hover:scale-105" asChild>
                                        <Link href={featuredEvent.ticketUrl || `/events/${featuredEvent.slug}`}>
                                            <Ticket className="mr-2 h-5 w-5" />
                                            Get Tickets
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex items-center justify-center h-full z-20 relative">
                        <h1 className="text-4xl font-bold text-muted-foreground/20">Events Engine</h1>
                    </div>
                )}
            </div>

            {/* Events Filter View */}
            <div className="container mx-auto px-4 mt-12">
                <h2 className="text-2xl font-bold tracking-tight mb-8">All Events</h2>
                <EventsView
                    todayEvents={todayEvents}
                    upcomingEvents={upcomingEvents}
                    pastEvents={pastEvents}
                    locations={allLocations}
                />
            </div>
        </div>
    )
}
