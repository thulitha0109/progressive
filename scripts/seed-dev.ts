import { PrismaClient, Prisma, Artist, Genre } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

// --- Utilities ---
function generateSlug(name: string): string {
    return name.toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '') + "-" + Date.now().toString().slice(-4)
}

function generateWaveform(samples = 100): number[] {
    return Array.from({ length: samples }, () => Math.random())
}

// --- Data ---
const ARTISTS = [
    { name: "Neon Pulse", bio: "Electronic duo from the future.", imageUrl: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop" },
    { name: "Luna Drift", bio: "Ethereal soundscapes.", imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" },
    { name: "The Midnight Echo", bio: "Synthwave vibes.", imageUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop" },
    { name: "Solar Flare", bio: "High energy beats.", imageUrl: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop" },
]

// Generate more artists for testing scrolling
for (let i = 1; i <= 50; i++) {
    ARTISTS.push({
        name: `Artist ${i}`,
        bio: `Bio for Artist ${i}`,
        imageUrl: `https://i.pravatar.cc/150?u=${i}`
    })
}

const EVENTS = [
    {
        title: "Atmosphere 2025",
        description: "The biggest progressive house festival in Sri Lanka featuring top international DJs.",
        date: new Date("2025-04-12T18:00:00"),
        location: "Colombo",
        venue: "Lotus Tower Outdoor Arena",
        coverImage: "https://images.unsplash.com/photo-1470229722913-7ea951c17240?q=80&w=1600&auto=format&fit=crop",
        isFeatured: true,
        tickets: [
            { name: "General Admission", price: 5000, quantity: 500 },
            { name: "VIP", price: 15000, quantity: 100 }
        ]
    },
    {
        title: "Sunset Sessions: Hikkaduwa",
        description: "Chill vibes and deep house grooves by the beach.",
        date: new Date("2025-03-15T16:00:00"),
        location: "Hikkaduwa",
        venue: "Mambo's",
        coverImage: "https://images.unsplash.com/photo-1514525253440-b393452e8d26?q=80&w=1600&auto=format&fit=crop",
        isFeatured: false,
        tickets: [{ name: "Entry", price: 2000, quantity: 200 }]
    }
]

const SHOPS = [
    {
        name: "Rave Gear LK",
        description: "Your one-stop shop for festival outfits.",
        location: "Colombo 03",
        imageUrl: "https://images.unsplash.com/photo-1533174072545-e8d4aa97edf9?q=80&w=600&auto=format&fit=crop",
        isVerified: true,
        products: [
            {
                name: "LED Diffraction Glasses",
                description: "Experience the lights like never before.",
                price: 2500,
                stock: 50,
                images: ["https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?q=80&w=600&auto=format&fit=crop"]
            },
            {
                name: "Festival Hydration Pack",
                description: "Stay hydrated on the dancefloor.",
                price: 8500,
                stock: 20,
                images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?q=80&w=600&auto=format&fit=crop"]
            }
        ]
    }
]

// --- Seed Functions ---

async function seedAdmin() {
    console.log("Seeding admin...")
    const email = "admin@progressive.lk"
    const password = "adminpassword"
    const hashedPassword = await hash(password, 10)
    return await prisma.user.upsert({
        where: { email },
        update: {},
        create: { email, name: "Admin User", password: hashedPassword, role: "ADMIN" }
    })
}

async function seedGenres() {
    console.log("Seeding genres...")
    const GENRES = ["Progressive House", "Melodic Techno", "Deep House", "Techno", "Trance"]
    for (const name of GENRES) {
        await prisma.genre.upsert({
            where: { slug: name.toLowerCase().replace(/ /g, '-') },
            update: {},
            create: { name, slug: name.toLowerCase().replace(/ /g, '-') }
        })
    }
}

async function seedArtistsAndTracks() {
    console.log("Seeding artists and tracks...")
    const genres = await prisma.genre.findMany()
    const progressive = genres.find(g => g.slug === 'progressive-house')

    const createdArtists = []

    for (const a of ARTISTS) {
        const artist = await prisma.artist.create({
            data: {
                name: a.name,
                slug: generateSlug(a.name),
                bio: a.bio,
                imageUrl: a.imageUrl
            }
        })
        createdArtists.push(artist)

        // Create dummy tracks for each
        for (let i = 1; i <= 3; i++) {
            await prisma.track.create({
                data: {
                    title: `${a.name}'s Track ${i}`,
                    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Dummy MP3
                    imageUrl: a.imageUrl,
                    artistId: artist.id,
                    genreId: progressive?.id,
                    // genre: progressive?.name || "Unknown", // Deprecated field
                    scheduledFor: new Date(),
                    timeZone: "Asia/Colombo",
                    label: "Progressive Records",
                    type: ["Remix", "Bootleg", "Mashup"][Math.floor(Math.random() * 3)],
                    waveformPeaks: generateWaveform()
                }
            })
        }
    }
    return { artists: createdArtists, genres }
}

async function seedPodcasts(artists: Artist[], genres: Genre[]) {
    console.log("Seeding podcasts...")
    const progressive = genres.find(g => g.slug === 'progressive-house')

    // Seed a few podcasts linked to random artists
    const PODCASTS = [
        { title: "Progressive Sessions 001", description: "Deep vibes only." },
        { title: "Techno Bunker 042", description: "Underground sounds." },
        { title: "Sunday Morning", description: "Relaxing beats." },
    ]

    for (const [index, p] of PODCASTS.entries()) {
        const artist = artists[index % artists.length]

        await prisma.podcast.create({
            data: {
                title: p.title,
                slug: generateSlug(p.title),
                description: p.description,
                audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
                imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop",
                scheduledFor: new Date(),
                timeZone: "Asia/Colombo",
                artistId: artist.id,
                genreId: progressive?.id,
                sequence: index + 1,
                waveformPeaks: generateWaveform()
            }
        })
    }
}

async function seedEvents() {
    console.log("Seeding events...")
    for (const e of EVENTS) {
        await prisma.event.create({
            data: {
                title: e.title,
                slug: generateSlug(e.title),
                description: e.description,
                date: e.date,
                location: e.location,
                venue: e.venue,
                coverImage: e.coverImage,
                isFeatured: e.isFeatured,
                tickets: {
                    create: e.tickets.map(t => ({
                        ...t,
                        price: new Prisma.Decimal(t.price)
                    }))
                }
            }
        })
    }
}

async function seedShops() {
    console.log("Seeding shops...")
    for (const s of SHOPS) {
        await prisma.shop.create({
            data: {
                name: s.name,
                slug: generateSlug(s.name),
                description: s.description,
                location: s.location,
                imageUrl: s.imageUrl,
                isVerified: s.isVerified,
                products: {
                    create: s.products.map(p => ({
                        name: p.name,
                        slug: generateSlug(p.name),
                        description: p.description,
                        price: new Prisma.Decimal(p.price),
                        stock: p.stock,
                        images: p.images
                    }))
                }
            }
        })
    }
}

async function seedBlog(adminId: string) {
    console.log("Seeding blog...")
    const cat = await prisma.category.create({
        data: { name: "Music News", slug: "music-news", description: "Latest updates" }
    })

    await prisma.blogPost.create({
        data: {
            title: "Welcome to Progressive.lk",
            slug: "welcome-progressive-lk",
            content: "This is the launch of the new platform.",
            excerpt: "Welcome to the new home of Sri Lankan electronic music.",
            coverImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
            authorId: adminId,
            categoryId: cat.id,
            publishedAt: new Date()
        }
    })
}

async function main() {
    console.log("🌱 Starting Development Seed...")

    // Cleanup
    await prisma.eventTicket.deleteMany(); await prisma.event.deleteMany();
    await prisma.review.deleteMany(); await prisma.product.deleteMany(); await prisma.shop.deleteMany();
    await prisma.track.deleteMany(); await prisma.artist.deleteMany();
    await prisma.blogPost.deleteMany(); await prisma.category.deleteMany();

    // Seed
    const admin = await seedAdmin()
    await seedGenres()
    const { artists, genres } = await seedArtistsAndTracks()
    await seedPodcasts(artists, genres)
    await seedEvents()
    await seedShops()
    await seedBlog(admin.id)

    console.log("✅ Development Seed Complete.")
}

main()
    .then(async () => { await prisma.$disconnect() })
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1) })
