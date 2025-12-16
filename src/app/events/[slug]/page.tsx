import { notFound } from "next/navigation"
import { getEventBySlug } from "@/server/actions/event"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, MapPin, Ticket as TicketIcon, Clock, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function SingleEventPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const event = await getEventBySlug(slug)

    if (!event) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero / Header - Standardized Design */}
            <div className="relative h-[400px] w-full overflow-hidden bg-muted">
                {event.coverImage ? (
                    <div className="absolute inset-0">
                        <img
                            src={event.coverImage}
                            alt={event.title}
                            className="h-full w-full object-cover opacity-40 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-secondary">
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}

                <div className="container relative flex h-full flex-col justify-end px-4 md:px-6 pb-12">
                    <div className="flex flex-col gap-4 max-w-4xl">
                        {event.isFeatured && (
                            <Badge className="w-fit bg-primary text-primary-foreground hover:bg-primary/90">
                                Featured Event
                            </Badge>
                        )}
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground leading-tight">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap gap-6 text-muted-foreground md:text-lg">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                <span>
                                    {event.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span>
                                    {event.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <span>{event.venue ? `${event.venue}, ${event.location}` : event.location}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-12 grid gap-12 lg:grid-cols-[2fr_1fr]">
                {/* Main Content */}
                <div className="flex flex-col gap-8">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">About the Event</h2>
                        <div className="prose prose-invert max-w-none text-muted-foreground whitespace-pre-line">
                            {event.description}
                        </div>
                    </section>

                    {/* Placeholder for Lineup or other details */}
                </div>

                {/* Sidebar / Ticket Booking */}
                <div className="flex flex-col gap-6">
                    <Card className="border-none bg-secondary/10 sticky top-24">
                        <CardContent className="p-6 flex flex-col gap-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <TicketIcon className="h-5 w-5 text-primary" />
                                Get Tickets
                            </h3>

                            <div className="flex flex-col gap-3">
                                {event.tickets && event.tickets.length > 0 ? (
                                    event.tickets.map((ticket) => (
                                        <div key={ticket.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{ticket.name}</span>
                                                <span className="text-xs text-muted-foreground">
                                                    {ticket.quantity && ticket.quantity > 0 ? `${ticket.quantity} remaining` : 'Sold out'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-lg">
                                                    {ticket.currency} {Number(ticket.price).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-muted-foreground text-sm italic">
                                        Ticket information not available directly.
                                        {event.ticketUrl && " Check external link."}
                                    </div>
                                )}
                            </div>

                            {event.tickets && event.tickets.length > 0 ? (
                                <Button size="lg" className="w-full font-bold">
                                    Book Now
                                </Button>
                            ) : event.ticketUrl ? (
                                <Button size="lg" className="w-full font-bold" asChild>
                                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                                        Buy Tickets (External)
                                    </a>
                                </Button>
                            ) : (
                                <Button size="lg" disabled className="w-full">
                                    Tickets Not Available
                                </Button>
                            )}

                            <div className="text-xs text-center text-muted-foreground">
                                Secure payment powered by Stripe (Mock)
                            </div>
                        </CardContent>
                    </Card>

                    <Button variant="outline" className="w-full gap-2">
                        <Share2 className="h-4 w-4" />
                        Share Event
                    </Button>
                </div>
            </div>
        </div>
    )
}
