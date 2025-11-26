import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

/**
 * Generate URL-friendly slug from a string
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')           // spaces to hyphens
        .replace(/[^\w\-]+/g, '')       // remove special chars
        .replace(/\-\-+/g, '-')         // collapse multiple hyphens
        .replace(/^-+/, '')             // trim hyphens from start
        .replace(/-+$/, '')             // trim hyphens from end
}

const ARTISTS = [
    {
        name: "Neon Pulse",
        bio: "Electronic duo from the future.",
        imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop",
    },
    {
        name: "Luna Drift",
        bio: "Ethereal soundscapes for dreaming.",
        imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    },
    {
        name: "The Midnight Echo",
        bio: "Synthwave vibes all night long.",
        imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
    },
    {
        name: "Solar Flare",
        bio: "High energy beats.",
        imageUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop",
    },
    {
        name: "Velvet Shade",
        bio: "Smooth jazz meets modern pop.",
        imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop",
    },
]

const TRACKS = [
    { title: "Cyber City", artistIndex: 0, isUpcoming: false, genre: "Progressive House" },
    { title: "Night Drive", artistIndex: 0, isUpcoming: true, genre: "Melodic Techno" },
    { title: "Starlight", artistIndex: 1, isUpcoming: false, genre: "Trance" },
    { title: "Dreaming", artistIndex: 1, isUpcoming: false, genre: "Progressive Trance" },
    { title: "Retro Highway", artistIndex: 2, isUpcoming: false, genre: "Techno" },
    { title: "Neon Nights", artistIndex: 2, isUpcoming: true, genre: "Progressive House" },
    { title: "Sunburn", artistIndex: 3, isUpcoming: false, genre: "Tech House" },
    { title: "Heatwave", artistIndex: 3, isUpcoming: true, genre: "Deep House" },
    { title: "Smooth Operator", artistIndex: 4, isUpcoming: false, genre: "Deep House" },
    { title: "Midnight Blue", artistIndex: 4, isUpcoming: false, genre: "Melodic Techno" },
]

async function main() {
    console.log("Start seeding dummy data...")

    // Create Artists with slugs
    const artists = []
    for (const artistData of ARTISTS) {
        const slug = generateSlug(artistData.name)
        const artist = await prisma.artist.create({
            data: {
                name: artistData.name,
                slug,
                bio: artistData.bio,
                imageUrl: artistData.imageUrl,
            },
        })
        artists.push(artist)
        console.log(`Created artist: ${artist.name} (slug: ${artist.slug})`)
    }

    // Create Tracks
    for (const trackData of TRACKS) {
        const artist = artists[trackData.artistIndex]
        const scheduledFor = trackData.isUpcoming
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago

        // Find genre by name
        const genre = await prisma.genre.findFirst({
            where: { name: trackData.genre }
        })

        await prisma.track.create({
            data: {
                title: trackData.title,
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Placeholder audio
                imageUrl: artist.imageUrl, // Use artist image for track cover for now
                genreId: genre ? genre.id : null,
                scheduledFor,
                artistId: artist.id,
            },
        })
        console.log(`Created track: ${trackData.title} (${trackData.isUpcoming ? "Upcoming" : "Published"}) - Genre: ${trackData.genre}`)
    }

    console.log("Seeding finished.")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
