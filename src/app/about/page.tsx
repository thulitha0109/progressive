export default function AboutPage() {
    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-8">About Progressive.lk</h1>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
                        <p className="text-muted-foreground">
                            Progressive.lk is dedicated to showcasing the future of sound. We provide a platform for progressive music artists
                            in Sri Lanka to share their work and connect with fans.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">What We Do</h2>
                        <p className="text-muted-foreground mb-4">
                            Our platform offers:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Curated progressive music tracks from local artists</li>
                            <li>Upcoming release schedules and exclusive previews</li>
                            <li>Artist profiles and biographies</li>
                            <li>Podcast episodes and discussions about progressive music</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Community</h2>
                        <p className="text-muted-foreground">
                            We believe in the power of progressive music to bring people together. Our community consists of artists,
                            producers, DJs, and music enthusiasts who share a passion for innovative and forward-thinking sound.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Get Involved</h2>
                        <p className="text-muted-foreground">
                            Whether you're an artist looking to share your music or a fan discovering new sounds,
                            Progressive.lk is your destination for the progressive music scene in Sri Lanka.
                        </p>
                    </section>

                    <p className="text-sm text-muted-foreground mt-12">
                        Progressive.lk © 2025 - Made with ❤️ for the progressive music community
                    </p>
                </div>
            </div>
        </div>
    )
}
