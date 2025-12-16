"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"

export async function createEvent(formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dateStr = formData.get("date") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const coverImage = formData.get("coverImage") as string
    const ticketUrl = formData.get("ticketUrl") as string
    const isFeatured = formData.get("isFeatured") === "on"

    const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "") + "-" + Date.now().toString().slice(-4)

    try {
        await prisma.event.create({
            data: {
                title,
                slug,
                description,
                date: new Date(dateStr),
                location,
                venue: venue || null,
                coverImage: coverImage || null,
                ticketUrl: ticketUrl || null,
                isFeatured,
            }
        })
    } catch (error) {
        console.error("Failed to create event:", error)
        return { error: "Failed to create event" }
    }

    revalidatePath("/admin/events")
    revalidatePath("/events")
    redirect("/admin/events")
}

export async function deleteEvent(id: string) {
    try {
        await prisma.event.delete({ where: { id } })
    } catch (error) {
        console.error("Failed to delete event:", error)
        return { error: "Failed to delete event" }
    }

    revalidatePath("/admin/events")
    revalidatePath("/events")
}

export async function updateEvent(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dateStr = formData.get("date") as string
    const location = formData.get("location") as string
    const venue = formData.get("venue") as string
    const coverImage = formData.get("coverImage") as string
    const ticketUrl = formData.get("ticketUrl") as string
    const isFeatured = formData.get("isFeatured") === "on"

    try {
        await prisma.event.update({
            where: { id },
            data: {
                title,
                description,
                date: new Date(dateStr),
                location,
                venue: venue || null,
                coverImage: coverImage || null,
                ticketUrl: ticketUrl || null,
                isFeatured,
            }
        })
    } catch (error) {
        console.error("Failed to update event:", error)
        return { error: "Failed to update event" }
    }

    revalidatePath("/admin/events")
    revalidatePath("/events")
    redirect("/admin/events")
}

// Ticket Management
export async function addEventTicket(eventId: string, formData: FormData) {
    const name = formData.get("name") as string
    const price = formData.get("price") as string
    const quantity = formData.get("quantity") as string

    await prisma.eventTicket.create({
        data: {
            eventId,
            name,
            price: new Prisma.Decimal(price),
            quantity: quantity ? parseInt(quantity) : null,
        }
    })

    revalidatePath(`/admin/events/${eventId}/edit`)
}

export async function deleteEventTicket(ticketId: string) {
    // We need eventId to revalidate, so let's fetch it first or pass it. 
    // Optimization: returning path based on referer might be complex in server action without hidden field.
    // For now we just delete.
    const ticket = await prisma.eventTicket.delete({
        where: { id: ticketId },
        select: { eventId: true }
    })

    revalidatePath(`/admin/events/${ticket.eventId}/edit`)
}
