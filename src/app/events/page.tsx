import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
    const events = await prisma.event.findMany({
        where: {
            date: {
                gte: new Date(),
            },
        },
        orderBy: {
            date: "asc",
        },
    });

    return (
        <div className="container py-10">
            <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:gap-8">
                <div className="flex-1 space-y-4">
                    <h1 className="inline-block font-heading text-4xl tracking-tight lg:text-5xl">
                        Events
                    </h1>
                    <p className="text-xl text-muted-foreground">
                        Upcoming events, parties, and gatherings.
                    </p>
                </div>
            </div>
            <hr className="my-8" />
            {events?.length ? (
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className="group relative flex flex-col space-y-2 overflow-hidden rounded-lg border bg-background shadow-md transition-all hover:shadow-lg"
                        >
                            {event.coverImage && (
                                <div className="relative aspect-video overflow-hidden bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={event.coverImage}
                                        alt={event.title}
                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                            )}
                            <div className="flex flex-col flex-1 p-4 space-y-2">
                                <h2 className="text-2xl font-bold line-clamp-1">{event.title}</h2>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {formatDate(event.date)}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    {event.location}
                                </div>
                            </div>
                            <Link href={`/events/${event.slug}`} className="absolute inset-0">
                                <span className="sr-only">View Event</span>
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <p>No upcoming events.</p>
            )}
        </div>
    );
}
