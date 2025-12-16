import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { EventEditForm } from "./event-edit-form"

export default async function EditEventPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const event = await prisma.event.findUnique({
        where: { id },
        include: { tickets: true }
    })

    if (!event) {
        notFound()
    }

    const serializedEvent = {
        ...event,
        tickets: event.tickets.map(ticket => ({
            ...ticket,
            price: Number(ticket.price)
        }))
    }

    return <EventEditForm event={serializedEvent} />
}
