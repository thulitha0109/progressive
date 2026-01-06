import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Music2 } from "lucide-react"

export function SiteFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container px-4 md:px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Branding Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <img src="/progressive.lk-icon.svg" alt="Progressive.lk" className="h-12 w-auto invert dark:invert-0" />
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            The ‘All in One’ void for the past, present, and future of Sri Lankan underground EDM culture.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/tracks" className="text-muted-foreground hover:text-primary transition-colors">
                                    Tracks
                                </Link>
                            </li>
                            <li>
                                <Link href="/artists" className="text-muted-foreground hover:text-primary transition-colors">
                                    Artists
                                </Link>
                            </li>
                            <li>
                                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                                    Blog
                                </Link>
                            </li>
                            <li>
                                <Link href="/tracks/upcoming" className="text-muted-foreground hover:text-primary transition-colors">
                                    Upcoming Releases
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Legal</h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                                    Terms of Service
                                </Link>
                            </li>
                            {/* <li>
                                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                                    About Us
                                </Link>
                            </li> */}
                            <li>
                                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                                    Contact
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider">Follow Us</h3>
                        <div className="flex space-x-4">
                            <Link
                                href="https://web.facebook.com/progressive.lk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-70 hover:opacity-100 transition-opacity"
                                aria-label="Facebook"
                            >
                                <img src="/images/ICONS/fb.svg" alt="Facebook" className="h-6 w-6 invert dark:invert-0" />
                            </Link>
                            <Link
                                href="https://www.instagram.com/progressive.lk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-70 hover:opacity-100 transition-opacity"
                                aria-label="Instagram"
                            >
                                <img src="/images/ICONS/instagram.svg" alt="Instagram" className="h-6 w-6 invert dark:invert-0" />
                            </Link>
                            <Link
                                href="https://www.tiktok.com/@progressive.lk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-70 hover:opacity-100 transition-opacity"
                                aria-label="Tiktok"
                            >
                                <img src="/images/ICONS/tiktok.svg" alt="Tiktok" className="h-6 w-6 invert dark:invert-0" />
                            </Link>
                        </div>
                        <p className="text-sm text-muted-foreground mt-4">
                            Stay connected for the latest releases and exclusive content.
                        </p>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="mt-12 pt-8 border-t">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-muted-foreground">
                            © {currentYear} Progressive.lk. All rights reserved.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Made with ❤️ for the music
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
