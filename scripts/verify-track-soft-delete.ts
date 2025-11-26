
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Verifying Track Soft Delete...')

    // 1. Setup: Create Artist and Track
    const artist = await prisma.artist.create({
        data: {
            name: 'Test Artist ' + Date.now(),
            slug: 'test-artist-' + Date.now(),
            bio: 'Test Bio',
        }
    })

    const track = await prisma.track.create({
        data: {
            title: 'Test Track ' + Date.now(),
            audioUrl: 'http://example.com/audio.mp3',
            scheduledFor: new Date(),
            artistId: artist.id,
        }
    })
    console.log('Created track:', track.id)

    // 2. Soft Delete
    await prisma.track.update({
        where: { id: track.id },
        data: { deletedAt: new Date() }
    })
    console.log('Soft deleted track')

    // 3. Verify filtered out
    const activeTracks = await prisma.track.findMany({
        where: {
            id: track.id,
            deletedAt: null
        }
    })
    if (activeTracks.length > 0) {
        throw new Error('Track should be filtered out')
    }
    console.log('Track is filtered out from active list')

    // 4. Verify in trash
    const trashedTracks = await prisma.track.findMany({
        where: {
            id: track.id,
            deletedAt: { not: null }
        }
    })
    if (trashedTracks.length === 0) {
        throw new Error('Track should be in trash')
    }
    console.log('Track found in trash')

    // 5. Restore
    await prisma.track.update({
        where: { id: track.id },
        data: { deletedAt: null }
    })
    console.log('Restored track')

    // 6. Verify back in active
    const restoredTracks = await prisma.track.findMany({
        where: {
            id: track.id,
            deletedAt: null
        }
    })
    if (restoredTracks.length === 0) {
        throw new Error('Track should be back in active list')
    }
    console.log('Track is back in active list')

    // Cleanup
    await prisma.track.delete({ where: { id: track.id } })
    await prisma.artist.delete({ where: { id: artist.id } })
    console.log('Cleanup done')

    console.log('Track Soft Delete verification successful!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
