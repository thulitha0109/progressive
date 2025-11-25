export default function PrivacyPage() {
    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>

                <div className="prose prose-gray dark:prose-invert max-w-none space-y-6">
                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
                        <p className="text-muted-foreground">
                            Welcome to Progressive.lk. We respect your privacy and are committed to protecting your personal data.
                            This privacy policy will inform you about how we handle your personal data when you visit our website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                        <p className="text-muted-foreground mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Identity Data: name, username, email address</li>
                            <li>Technical Data: IP address, browser type, time zone setting</li>
                            <li>Usage Data: information about how you use our website</li>
                            <li>Profile Data: your preferences and interests</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Data</h2>
                        <p className="text-muted-foreground mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>To provide and maintain our service</li>
                            <li>To notify you about changes to our service</li>
                            <li>To provide customer support</li>
                            <li>To gather analysis or valuable information to improve our service</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
                        <p className="text-muted-foreground">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost,
                            used or accessed in an unauthorized way, altered or disclosed.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                        <p className="text-muted-foreground">
                            If you have any questions about this Privacy Policy, please contact us.
                        </p>
                    </section>

                    <p className="text-sm text-muted-foreground mt-12">
                        Last updated: November 2025
                    </p>
                </div>
            </div>
        </div>
    )
}
