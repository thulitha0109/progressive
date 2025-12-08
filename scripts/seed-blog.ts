import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function seedBlogOnly() {
    console.log("🌱 Seeding blog data...")

    try {
        // Create categories
        const categories = await Promise.all([
            prisma.category.upsert({
                where: { slug: "music-production" },
                update: {},
                create: {
                    name: "Music Production",
                    slug: "music-production",
                },
            }),
            prisma.category.upsert({
                where: { slug: "artist-interviews" },
                update: {},
                create: {
                    name: "Artist Interviews",
                    slug: "artist-interviews",
                },
            }),
            prisma.category.upsert({
                where: { slug: "industry-news" },
                update: {},
                create: {
                    name: "Industry News",
                    slug: "industry-news",
                },
            }),
        ])

        console.log(`✅ Created ${categories.length} categories`)

        // Create tags
        const tags = await Promise.all([
            prisma.tag.upsert({
                where: { slug: "progressive-house" },
                update: {},
                create: {
                    name: "Progressive House",
                    slug: "progressive-house",
                },
            }),
            prisma.tag.upsert({
                where: { slug: "production-tips" },
                update: {},
                create: {
                    name: "Production Tips",
                    slug: "production-tips",
                },
            }),
            prisma.tag.upsert({
                where: { slug: "studio-gear" },
                update: {},
                create: {
                    name: "Studio Gear",
                    slug: "studio-gear",
                },
            }),
        ])

        console.log(`✅ Created ${tags.length} tags`)

        // Get admin user
        const adminUser = await prisma.user.findFirst({
            where: { role: "ADMIN" },
        })

        if (!adminUser) {
            console.log("⚠️ No admin user found. Please run seed:admin first.")
            return
        }

        // Create sample blog posts
        const blogPosts = [
            {
                title: "The Rise of Progressive House in 2025",
                slug: "the-rise-of-progressive-house-in-2025",
                content: `# The Rise of Progressive House in 2025

Progressive house has seen a massive resurgence in 2025, with artists pushing the boundaries of the genre in exciting new directions.

## Key Trends

- Melodic complexity is back
- Hybrid sounds blending trance and techno
- Long-form storytelling in tracks

This is an exciting time for progressive house music!`,
                excerpt: "Exploring how progressive house is evolving in 2025 with new sounds and innovative artists.",
                coverImage: "https://images.unsplash.com/photo-1571974599782-87624638275d?w=800",
                categoryId: categories[0].id,
                publishedAt: new Date(),
            },
            {
                title: "Essential Gear for Your Home Studio",
                slug: "essential-gear-for-your-home-studio",
                content: `# Essential Gear for Your Home Studio

Setting up a home studio doesn't have to break the bank. Here's what you really need.

## The Basics

1. **Audio Interface** - Your gateway to quality sound
2. **Studio Monitors** - Accurate playback is essential
3. **DAW** - Your creative command center

Start with these essentials and expand as you grow!`,
                excerpt: "A practical guide to building your first home studio on a budget.",
                coverImage: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=800",
                categoryId: categories[0].id,
                publishedAt: new Date(),
            },
            {
                title: "Interview: Inside a Producer's Creative Process",
                slug: "interview-inside-a-producers-creative-process",
                content: `# Interview: Inside a Producer's Creative Process

We sat down with top producers to understand how they turn ideas into hits.

## Key Takeaways

- Start with emotion, not technique
- Embrace happy accidents
- Know when a track is finished

The creative process is different for everyone!`,
                excerpt: "Top producers share their secrets for staying creative and productive.",
                coverImage: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800",
                categoryId: categories[1].id,
                publishedAt: new Date(),
            },
        ]

        for (const post of blogPosts) {
            await prisma.blogPost.upsert({
                where: { slug: post.slug },
                update: {},
                create: {
                    ...post,
                    authorId: adminUser.id,
                    tags: {
                        connect: tags.slice(0, 2).map(tag => ({ id: tag.id })),
                    },
                },
            })
        }

        console.log(`✅ Created ${blogPosts.length} blog posts`)
        console.log("✅ Blog seeding completed successfully!")
    } catch (error) {
        console.error("❌ Error seeding blog data:", error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

seedBlogOnly()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
