import Link from "next/link"
import Image from "next/image"
import { Heart } from "lucide-react"

export function SiteFooter() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container px-4 md:px-6 py-12">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Branding Section */}
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2 relative h-12 w-48">
                            <Image src="/progressive.lk-icon.svg" alt="Progressive.lk" fill className="object-contain object-left invert dark:invert-0" />
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
                                <Link href="/podcasts" className="text-muted-foreground hover:text-primary transition-colors">
                                    Podcasts
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
                                className="opacity-70 hover:opacity-100 transition-opacity relative h-6 w-6"
                                aria-label="Facebook"
                            >
                                <Image src="/images/ICONS/fb.svg" alt="Facebook" fill className="invert dark:invert-0 object-contain" />
                            </Link>
                            <Link
                                href="https://www.instagram.com/progressive.lk/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-70 hover:opacity-100 transition-opacity relative h-6 w-6"
                                aria-label="Instagram"
                            >
                                <Image src="/images/ICONS/instagram.svg" alt="Instagram" fill className="invert dark:invert-0 object-contain" />
                            </Link>
                            <Link
                                href="https://www.tiktok.com/@progressive.lk"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="opacity-70 hover:opacity-100 transition-opacity relative h-6 w-6"
                                aria-label="Tiktok"
                            >
                                <Image src="/images/ICONS/tiktok.svg" alt="Tiktok" fill className="invert dark:invert-0 object-contain" />
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
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                            Made with <Heart className="h-3 w-3 fill-white" /> for the music
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
