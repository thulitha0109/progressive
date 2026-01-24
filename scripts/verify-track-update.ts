
import { PrismaClient } from '@prisma/client'
import { updateTrack } from '../src/server/actions/tracks'

const prisma = new PrismaClient()

// Mock FormData
class MockFormData {
    private data: Map<string, unknown> = new Map()

    append(key: string, value: unknown) {
        this.data.set(key, value)
    }

    get(key: string) {
        return this.data.get(key)
    }
}

// We need to mock revalidatePath and redirect since they are Next.js specific
// and won't work in a standalone script easily without full Next.js context.
// However, since we are importing the server action, it might try to use them.
// For this verification, we mainly want to check if the database update works
// and if the variable reference error is gone.
// We might need to mock the module imports if they fail.
// But let's try running it first. If it fails on revalidatePath/redirect,
// it means the core logic passed.

async function main() {
    console.log('Verifying Track Update...')

    // 1. Setup: Create Artist, Genre, and Track
    const artist = await prisma.artist.create({
        data: {
            name: 'Update Test Artist ' + Date.now(),
            slug: 'update-test-artist-' + Date.now(),
            bio: 'Bio'
        }
    })

    const genre = await prisma.genre.create({
        data: { name: 'Update Test Genre ' + Date.now(), slug: 'update-test-genre-' + Date.now() }
    })

    const track = await prisma.track.create({
        data: {
            title: 'Original Title',
            audioUrl: 'http://example.com/audio.mp3',
            scheduledFor: new Date(),
            artistId: artist.id,
        }
    })
    console.log('Created track:', track.id)

    // 2. Prepare FormData for update
    const formData = new MockFormData()
    formData.append('title', 'Updated Title')
    formData.append('artistId', artist.id)
    formData.append('genreId', genre.id)
    formData.append('scheduledFor', new Date().toISOString())
    // We don't provide files to avoid file upload logic in this test

    // 3. Call updateTrack
    try {
        // @ts-expect-error - Mocking FormData compatibility
        await updateTrack(track.id, formData)
        console.log('updateTrack called successfully')
    } catch (error: unknown) {
        // If it's a redirect error, it means success (Next.js redirect throws an error)
        const err = error as Error
        if (err.message === 'NEXT_REDIRECT' || err.message.includes('NEXT_REDIRECT')) {
            console.log('Caught expected redirect, update successful')
        } else {
            throw error
        }
    }

    // 4. Verify update in DB
    const updatedTrack = await prisma.track.findUnique({
        where: { id: track.id },
        include: { genreRel: true }
    })

    if (!updatedTrack) throw new Error('Track not found')

    if (updatedTrack.title !== 'Updated Title') {
        throw new Error(`Title mismatch: expected 'Updated Title', got '${updatedTrack.title}'`)
    }

    if (updatedTrack.genreId !== genre.id) {
        throw new Error(`GenreId mismatch: expected '${genre.id}', got '${updatedTrack.genreId}'`)
    }

    console.log('Track updated correctly in DB')

    // Cleanup
    await prisma.track.delete({ where: { id: track.id } })
    await prisma.artist.delete({ where: { id: artist.id } })
    await prisma.genre.delete({ where: { id: genre.id } })
    console.log('Cleanup done')
}

main()
    .catch((e) => {
        console.error('Verification failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
