"use client"

import { useState } from "react"
import { Event, EventTicket } from "@prisma/client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Search } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

type EventWithTickets = Event & { tickets: EventTicket[] }

interface EventsViewProps {
    todayEvents: EventWithTickets[]
    upcomingEvents: EventWithTickets[]
    pastEvents: EventWithTickets[]
    locations: string[]
}

export function EventsView({ todayEvents, upcomingEvents, pastEvents, locations }: EventsViewProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [locationFilter, setLocationFilter] = useState("all")

    const filterEvents = (events: EventWithTickets[]) => {
        return events.filter(event => {
            const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                event.location.toLowerCase().includes(searchQuery.toLowerCase())
            const matchesLocation = locationFilter === "all" || event.location === locationFilter
            return matchesSearch && matchesLocation
        })
    }

    const renderEventGrid = (events: EventWithTickets[]) => {
        const filtered = filterEvents(events)

        if (filtered.length === 0) {
            return (
                <div className="text-center py-20 border rounded-lg bg-secondary/5">
                    <Calendar className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">No events found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters.</p>
                </div>
            )
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((event) => (
                    <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group relative overflow-hidden rounded-xl border bg-card hover:border-primary/50 transition-colors"
                    >
                        <div className="aspect-[16/9] relative overflow-hidden">
                            <Image
                                src={event.coverImage || "/placeholder-event.jpg"}
                                alt={event.title}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <div className="absolute top-2 right-2 bg-background/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold ring-1 ring-border">
                                {new Date(event.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                {event.title}
                            </h3>
                            <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>
                                        {new Date(event.date).toLocaleTimeString("en-US", {
                                            hour: "numeric",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between pt-4 border-t">
                                <div className="text-sm font-medium">
                                    {event.tickets.length > 0 ? (
                                        `From LKR ${Math.min(...event.tickets.map(t => Number(t.price))).toLocaleString()}`
                                    ) : (
                                        <span className="text-muted-foreground">Free Entry</span>
                                    )}
                                </div>
                                <Button size="sm" variant="secondary">Details</Button>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search events..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <select
                        className="h-10 px-3 rounded-md border border-input bg-background"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                    >
                        <option value="all">All Locations</option>
                        {locations.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
                    <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                    <TabsTrigger value="today">Today</TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-8">
                    {renderEventGrid(upcomingEvents)}
                </TabsContent>

                <TabsContent value="today" className="mt-8">
                    {renderEventGrid(todayEvents)}
                </TabsContent>

                <TabsContent value="past" className="mt-8">
                    {renderEventGrid(pastEvents)}
                </TabsContent>
            </Tabs>
        </div>
    )
}
