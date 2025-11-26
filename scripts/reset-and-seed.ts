
import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'

const prisma = new PrismaClient()

async function main() {
    console.log('🗑️  Cleaning database...')

    // Delete in order of dependencies
    await prisma.track.deleteMany()
    await prisma.artist.deleteMany()
    await prisma.genre.deleteMany()
    await prisma.user.deleteMany()
    // Add other models if needed

    console.log('✅ Database cleaned')

    console.log('🌱 Running seeders...')

    try {
        console.log('Running seed-genres.js...')
        execSync('node scripts/seed-genres.js', { stdio: 'inherit' })

        console.log('Running seed-dummy.js...')
        // Check if seed-dummy exists, otherwise run seed-admin or whatever is appropriate
        // The user asked to "clean the db and seed again", assuming they mean the dummy data too
        execSync('node scripts/seed-dummy.js', { stdio: 'inherit' })

        console.log('Running seed-admin.js...')
        execSync('node scripts/seed-admin.js', { stdio: 'inherit' })

        console.log('✅ Seeding completed')
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
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
