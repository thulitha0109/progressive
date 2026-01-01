"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Trash } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { updateEvent, addEventTicket, deleteEventTicket } from "@/server/actions/admin/event"

type EventWithTickets = {
    id: string
    title: string
    description: string
    date: Date
    location: string
    venue: string | null
    coverImage: string | null
    ticketUrl: string | null
    isFeatured: boolean
    tickets: {
        id: string
        name: string
        price: any // Decimal
        currency: string
        quantity: number | null
    }[]
}

export function EventEditForm({ event }: { event: EventWithTickets }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState(event.coverImage || "")

    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const dateString = new Date(new Date(event.date).getTime() - (new Date(event.date).getTimezoneOffset() * 60000)).toISOString().slice(0, 16)

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            // Ensure the image URL is included in the form data
            formData.set("coverImage", imageUrl)

            await updateEvent(event.id, formData)
            router.refresh()
        })
    }

    return (
        <div className="max-w-4xl mx-auto grid gap-10 lg:grid-cols-[2fr_1fr]">
            {/* Main Form */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/events">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
                </div>

                <form action={handleSubmit} className="space-y-8">
                    <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">Event Title</Label>
                            <Input id="title" name="title" defaultValue={event.title} required />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                required
                                defaultValue={event.description}
                                className="min-h-[150px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="date">Date & Time</Label>
                                <Input id="date" name="date" type="datetime-local" defaultValue={dateString} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="location">City/Location</Label>
                                <Input id="location" name="location" defaultValue={event.location} required />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="venue">Venue Name</Label>
                            <Input id="venue" name="venue" defaultValue={event.venue || ""} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Cover Image</Label>
                            <ImageUpload
                                value={imageUrl}
                                onChange={setImageUrl}
                                folder="events"
                                helperText="Max 2MB"
                            />
                            {/* Hidden input to ensure value is submitted if JS falls back (though we intercept action) */}
                            <input type="hidden" name="coverImage" value={imageUrl} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="ticketUrl">External Ticket URL</Label>
                            <Input id="ticketUrl" name="ticketUrl" defaultValue={event.ticketUrl || ""} />
                        </div>

                        <div className="flex items-center gap-2 border p-4 rounded-lg bg-secondary/10">
                            <Switch id="isFeatured" name="isFeatured" defaultChecked={event.isFeatured} />
                            <Label htmlFor="isFeatured" className="cursor-pointer">Feature this event on homepage</Label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Updating..." : "Update Event"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Ticket Management Sidebar - Keeping mostly static as it interacts via direct actions */}
            <div className="flex flex-col gap-8">
                <div className="p-6 border rounded-lg bg-card">
                    <h3 className="font-bold mb-4 text-lg">Manage Tickets</h3>

                    <div className="flex flex-col gap-4 mb-6">
                        {event.tickets.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-3 bg-secondary/20 rounded border">
                                <div>
                                    <div className="font-medium text-sm">{ticket.name}</div>
                                    <div className="text-xs text-muted-foreground">{ticket.currency} {Number(ticket.price)} • Qty: {ticket.quantity ?? 'Unl'}</div>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                        onClick={() => {
                                            startTransition(async () => {
                                                await deleteEventTicket(ticket.id)
                                                router.refresh()
                                            })
                                        }}
                                        disabled={isPending}
                                    >
                                        <Trash className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {event.tickets.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No tickets added yet.</p>
                        )}
                    </div>

                    <form
                        action={async (formData) => {
                            await addEventTicket(event.id, formData)
                            router.refresh()
                        }}
                        className="space-y-4 pt-4 border-t"
                    >
                        <h4 className="text-sm font-medium">Add New Ticket</h4>
                        <div className="grid gap-2">
                            <Input name="name" placeholder="Ticket Name (e.g. VIP)" required className="h-8 text-sm" />
                            <div className="flex gap-2">
                                <Input name="price" type="number" placeholder="Price" required className="h-8 text-sm" />
                                <Input name="quantity" type="number" placeholder="Qty" className="h-8 text-sm" />
                            </div>
                        </div>
                        <Button size="sm" type="submit" className="w-full">Add Ticket</Button>
                    </form>
                </div>
            </div>
        </div>
    )
}
