"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createEvent } from "@/server/actions/admin/event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ChevronLeft, Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"

export default function EventForm() {
    const [isPending, startTransition] = useTransition()
    const [imageUrl, setImageUrl] = useState<string>("")

    // We can use a simple form action wrapper or submit handler
    async function handleSubmit(formData: FormData) {
        if (imageUrl) {
            formData.set("coverImage", imageUrl)
        }

        startTransition(async () => {
            await createEvent(formData)
        })
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/events">
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Create Event</h1>
            </div>

            <form action={handleSubmit} className="space-y-8">
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="title">Event Title</Label>
                        <Input id="title" name="title" required placeholder="e.g. Atmosphere 2025" disabled={isPending} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            name="description"
                            required
                            placeholder="Event details..."
                            className="min-h-[150px]"
                            disabled={isPending}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="date">Date & Time</Label>
                            <Input id="date" name="date" type="datetime-local" required disabled={isPending} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="location">City/Location</Label>
                            <Input id="location" name="location" required placeholder="e.g. Colombo" disabled={isPending} />
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="venue">Venue Name (Optional)</Label>
                        <Input id="venue" name="venue" placeholder="e.g. Lotus Tower" disabled={isPending} />
                    </div>

                    <div className="grid gap-2">
                        <Label>Cover Image</Label>
                        <ImageUpload
                            value={imageUrl}
                            onChange={setImageUrl}
                            disabled={isPending}
                            folder="events"
                            helperText="Max 2MB"
                        />
                        <input type="hidden" name="coverImage" value={imageUrl} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="ticketUrl">External Ticket URL (Optional)</Label>
                        <Input id="ticketUrl" name="ticketUrl" placeholder="https://tickets.lk/..." disabled={isPending} />
                        <p className="text-xs text-muted-foreground">If selling tickets externally.</p>
                    </div>

                    <div className="flex items-center gap-2 border p-4 rounded-lg bg-secondary/10">
                        <Switch id="isFeatured" name="isFeatured" disabled={isPending} />
                        <Label htmlFor="isFeatured" className="cursor-pointer">Feature this event on homepage (carousel)</Label>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button variant="outline" asChild disabled={isPending}>
                        <Link href="/admin/events">Cancel</Link>
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isPending ? "Creating..." : "Create Event"}
                    </Button>
                </div>
            </form>
        </div>
    )
}
