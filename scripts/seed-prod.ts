import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const prisma = new PrismaClient()

async function seedAdmin() {
    console.log("Seeding admin user...")
    const email = process.env.ADMIN_EMAIL || "admin@progressive.lk"
    const password = process.env.ADMIN_PASSWORD || "adminpassword"
    const name = "Admin User"

    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name,
            password: hashedPassword,
            role: "ADMIN",
        },
    })
    console.log(`✅ Admin user: ${user.email}`)
    return user
}

async function seedGenres() {
    console.log("Seeding genres...")
    const GENRES = [
        { name: "Progressive House", slug: "progressive-house" },
        { name: "Melodic Techno", slug: "melodic-techno" },
        { name: "Deep House", slug: "deep-house" },
        { name: "Techno", slug: "techno" },
        { name: "Trance", slug: "trance" },
        { name: "House", slug: "house" },
        { name: "Organic House", slug: "organic-house" },
        { name: "Downtempo", slug: "downtempo" },
    ]

    for (const g of GENRES) {
        await prisma.genre.upsert({
            where: { slug: g.slug },
            update: {},
            create: { name: g.name, slug: g.slug }
        })
    }
    console.log(`✅ Seeding genres complete.`)
}

async function main() {
    console.log("🚀 Starting Production Seed...")
    await seedAdmin()
    await seedGenres()
    console.log("✨ Production Seed Complete.")
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
