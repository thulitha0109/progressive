import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const artist = await prisma.artist.findFirst({
        where: {
            podcasts: {
                some: {}
            }
        },
        include: {
            podcasts: true
        }
    })

    if (artist) {
        console.log(`FOUND_ARTIST_SLUG: ${artist.slug}`)
        console.log(`PODCAST_COUNT: ${artist.podcasts.length}`)
    } else {
        console.log("NO_ARTIST_WITH_PODCASTS_FOUND")
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
