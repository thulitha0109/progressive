import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    const track = await prisma.track.findFirst({
        where: { title: "test" },
        include: { artist: true }
    })
    console.log("Found track:", track)

    // Also check Artist 1's track 1 just in case
    const seedTrack = await prisma.track.findFirst({
        where: { title: { contains: "Artist 1" } }
    })
    console.log("Seed track check:", seedTrack)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
