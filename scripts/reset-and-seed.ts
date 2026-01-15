
import { execSync } from 'child_process'

async function main() {
    console.log('🚀 Starting Reset and Seed Process...')

    try {
        // seed-dev.ts handles its own cleanup and seeding of all data types
        console.log('Running seed-dev.ts...')
        execSync('npx tsx scripts/seed-dev.ts', { stdio: 'inherit' })

        console.log('✅ Cycle completed successfully')
    } catch (error) {
        console.error('❌ Seeding failed:', error)
        process.exit(1)
    }
}

main()
