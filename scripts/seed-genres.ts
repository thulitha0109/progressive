import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const genres = [
    {
        name: 'House',
        subGenres: [
            'Progressive House',
            'Deep House',
            'Tech House',
            'Electro House',
            'Future House',
            'Tropical House',
            'Acid House',
            'Chicago House',
        ],
    },
    {
        name: 'Techno',
        subGenres: [
            'Melodic Techno',
            'Minimal Techno',
            'Acid Techno',
            'Dub Techno',
            'Hard Techno',
            'Detroit Techno',
        ],
    },
    {
        name: 'Trance',
        subGenres: [
            'Progressive Trance',
            'Uplifting Trance',
            'Psytrance',
            'Vocal Trance',
            'Tech Trance',
        ],
    },
    {
        name: 'Drum & Bass',
        subGenres: [
            'Liquid Funk',
            'Neurofunk',
            'Jump Up',
            'Techstep',
        ],
    },
    {
        name: 'Dubstep',
        subGenres: [
            'Brostep',
            'Chillstep',
            'Riddim',
        ],
    },
    {
        name: 'Ambient',
        subGenres: [
            'Dark Ambient',
            'Drone',
            'Space Music',
        ],
    },
    {
        name: 'Chillout',
        subGenres: [
            'Downtempo',
            'Trip Hop',
            'Lo-Fi',
        ],
    },
]

function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')     // Replace spaces with -
        .replace(/[^\w\-]+/g, '') // Remove all non-word chars
        .replace(/\-\-+/g, '-')   // Replace multiple - with single -
}

async function main() {
    console.log('Start seeding genres...')

    for (const genre of genres) {
        const parentSlug = slugify(genre.name)

        // Create or update parent genre
        const parent = await prisma.genre.upsert({
            where: { slug: parentSlug },
            update: { name: genre.name },
            create: {
                name: genre.name,
                slug: parentSlug,
            },
        })

        console.log(`Created/Updated parent genre: ${parent.name}`)

        // Create or update sub-genres
        if (genre.subGenres) {
            for (const subName of genre.subGenres) {
                const subSlug = slugify(subName)

                await prisma.genre.upsert({
                    where: { slug: subSlug },
                    update: {
                        name: subName,
                        parentId: parent.id
                    },
                    create: {
                        name: subName,
                        slug: subSlug,
                        parentId: parent.id,
                    },
                })

                console.log(`  - Created/Updated sub-genre: ${subName}`)
            }
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
