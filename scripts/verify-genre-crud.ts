
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying Genre CRUD...')

    // 1. Create
    const genreName = 'Test Genre ' + Date.now()
    const genreSlug = genreName.toLowerCase().replace(/ /g, '-')

    const created = await prisma.genre.create({
        data: {
            name: genreName,
            slug: genreSlug,
        }
    })
    console.log('Created genre:', created.id, created.name)

    // 2. Read
    const fetched = await prisma.genre.findUnique({
        where: { id: created.id }
    })
    if (!fetched || fetched.name !== genreName) {
        throw new Error('Failed to fetch created genre')
    }
    console.log('Fetched genre:', fetched.name)

    // 3. Update
    const updatedName = genreName + ' Updated'
    const updated = await prisma.genre.update({
        where: { id: created.id },
        data: { name: updatedName }
    })
    if (updated.name !== updatedName) {
        throw new Error('Failed to update genre')
    }
    console.log('Updated genre:', updated.name)

    // 4. Delete
    await prisma.genre.delete({
        where: { id: created.id }
    })

    const deleted = await prisma.genre.findUnique({
        where: { id: created.id }
    })
    if (deleted) {
        throw new Error('Failed to delete genre')
    }
    console.log('Deleted genre')

    console.log('Genre CRUD verification successful!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
