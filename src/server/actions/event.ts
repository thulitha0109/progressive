"use server"

import { prisma } from "@/lib/prisma"

export async function getEvents() {
    return prisma.event.findMany({
        orderBy: { date: "asc" },
        where: {
            date: {
                gte: new Date() // Only upcoming events by default
            }
        },
        include: {
            tickets: true
        }
    })
}

export async function getPastEvents() {
    return prisma.event.findMany({
        orderBy: { date: "desc" },
        where: {
            date: {
                lt: new Date()
            }
        }
    })
}

export async function getEventBySlug(slug: string) {
    return prisma.event.findUnique({
        where: { slug },
        include: {
            tickets: true
        }
    })
}
