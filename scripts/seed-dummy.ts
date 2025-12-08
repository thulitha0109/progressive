import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * Generate URL-friendly slug from a string
 */
function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

/**
 * Seed Artists
 */
async function seedArtists() {
    console.log("Seeding artists...")
    const ARTISTS = [
        {
            name: "Neon Pulse",
            bio: "Electronic duo from the future.",
            imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop",
            socialLinks: {
                instagram: "https://instagram.com/neonpulse",
                spotify: "https://open.spotify.com/artist/neonpulse"
            }
        },
        {
            name: "Luna Drift",
            bio: "Ethereal soundscapes for dreaming.",
            imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
            socialLinks: {
                soundcloud: "https://soundcloud.com/lunadrift",
                twitter: "https://twitter.com/lunadrift"
            }
        },
        {
            name: "The Midnight Echo",
            bio: "Synthwave vibes all night long.",
            imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
            socialLinks: {
                facebook: "https://facebook.com/midnightecho",
                tiktok: "https://tiktok.com/@midnightecho"
            }
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

    const artists = []
    for (const artistData of ARTISTS) {
        const slug = generateSlug(artistData.name)
        const artist = await prisma.artist.create({
            data: {
                name: artistData.name,
                slug,
                bio: artistData.bio,
                imageUrl: artistData.imageUrl,
                socialLinks: artistData.socialLinks || {},
            },
        })
        artists.push(artist)
        console.log(`Created artist: ${artist.name} (slug: ${artist.slug})`)
    }
    return artists
}

/**
 * Seed Tracks
 */
async function seedTracks(artists: any[]) {
    console.log("Seeding tracks...")
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

    for (const trackData of TRACKS) {
        const artist = artists[trackData.artistIndex]
        const scheduledFor = trackData.isUpcoming
            ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
            : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const genre = await prisma.genre.findFirst({
            where: { name: trackData.genre }
        })

        await prisma.track.create({
            data: {
                title: trackData.title,
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
                imageUrl: artist.imageUrl,
                genreId: genre ? genre.id : null,
                scheduledFor,
                artistId: artist.id,
            },
        })
        console.log(`Created track: ${trackData.title} (${trackData.isUpcoming ? "Upcoming" : "Published"}) - Genre: ${trackData.genre}`)
    }
}

/**
 * Seed Blog Categories, Tags, and Posts
 */
async function seedBlog(adminUserId: string) {
    console.log("Seeding blog categories...")

    const categories = []
    const CATEGORIES = [
        { name: "Music News", description: "Latest updates from the music world" },
        { name: "Artist Interviews", description: "In-depth conversations with our artists" },
        { name: "Production Tips", description: "Learn the craft of music production" },
        { name: "Event Coverage", description: "Recaps and highlights from events" },
    ]

    for (const catData of CATEGORIES) {
        const category = await prisma.category.create({
            data: {
                name: catData.name,
                slug: generateSlug(catData.name),
                description: catData.description,
            }
        })
        categories.push(category)
        console.log(`Created category: ${category.name}`)
    }

    console.log("Seeding blog tags...")
    const tags = []
    const TAGS = ["progressive-house", "techno", "interview", "production", "tutorial", "event"]

    for (const tagName of TAGS) {
        const tag = await prisma.tag.create({
            data: {
                name: tagName,
                slug: generateSlug(tagName),
            }
        })
        tags.push(tag)
        console.log(`Created tag: ${tag.name}`)
    }

    console.log("Seeding blog posts...")
    const POSTS = [
        {
            title: "The Rise of Progressive House in Sri Lanka",
            content: "Progressive house has been gaining momentum in the Sri Lankan music scene over the past few years. This genre, characterized by its melodic and atmospheric qualities, has found a dedicated audience among local music enthusiasts. In this article, we explore the journey of progressive house in Sri Lanka, from its underground beginnings to its current mainstream appeal.",
            excerpt: "Exploring the journey of progressive house music in Sri Lanka's electronic music scene.",
            categoryIndex: 0,
            coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
            published: true,
        },
        {
            title: "Interview with Neon Pulse: Crafting the Future Sound",
            content: "We sat down with Neon Pulse, one of the most innovative electronic duos in the progressive scene. They shared insights into their creative process, their influences, and what fans can expect from their upcoming releases. From their humble beginnings to performing at major festivals, Neon Pulse has been pushing the boundaries of electronic music.",
            excerpt: "An exclusive interview with the electronic duo Neon Pulse about their music and vision.",
            categoryIndex: 1,
            coverImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&h=400&fit=crop",
            published: true,
        },
        {
            title: "Mastering Progressive Drops: A Producer's Guide",
            content: "Creating a powerful progressive drop requires careful attention to energy management, sound design, and arrangement. In this comprehensive guide, we break down the essential elements of crafting drop that captivates your audience. Learn techniques used by top producers to build tension and release energy effectively.",
            excerpt: "Learn the techniques behind crafting powerful progressive drops in your productions.",
            categoryIndex: 2,
            coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800&h=400&fit=crop",
            published: true,
        },
        {
            title: "Upcoming: Electronic Music Festival 2025",
            content: "Mark your calendars! The Electronic Music Festival 2025 is set to be the biggest celebration of progressive sounds yet. Featuring headliners from across the globe and showcasing the best local talent, this event promises to be unforgettable. Stay tuned for lineup announcements and ticket information.",
            excerpt: "Get ready for the biggest electronic music festival of the year.",
            categoryIndex: 3,
            coverImage: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&h=400&fit=crop",
            published: false,
        },
    ]

    for (const postData of POSTS) {
        const post = await prisma.blogPost.create({
            data: {
                title: postData.title,
                slug: generateSlug(postData.title),
                content: postData.content,
                excerpt: postData.excerpt,
                coverImage: postData.coverImage,
                authorId: adminUserId,
                categoryId: categories[postData.categoryIndex].id,
                publishedAt: postData.published ? new Date() : null,
            }
        })
        console.log(`Created blog post: ${post.title} (${postData.published ? "Published" : "Draft"})`)
    }
}

/**
 * Clean up existing data
 */
async function cleanup() {
    console.log("Cleaning up existing data...")

    // Delete in order of dependencies
    await prisma.blogPost.deleteMany({})
    await prisma.tag.deleteMany({})
    await prisma.category.deleteMany({})
    await prisma.track.deleteMany({})
    await prisma.artist.deleteMany({})

    console.log("Cleanup complete.")
}

/**
 * Main seeding function
 */
async function main() {
    console.log("Start seeding dummy data...")

    // Clean up existing data first
    await cleanup()

    // Get or create admin user for blog posts
    let adminUser = await prisma.user.findFirst({
        where: { role: "ADMIN" }
    })

    if (!adminUser) {
        console.log("No admin user found. Blog seeding will be skipped.")
        console.log("Please create an admin user first using seed-admin.js")
    }

    // Seed artists
    const artists = await seedArtists()

    // Seed tracks
    await seedTracks(artists)

    // Seed blog (if admin exists)
    if (adminUser) {
        await seedBlog(adminUser.id)
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
