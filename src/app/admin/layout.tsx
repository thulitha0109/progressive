"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Mic2, Music, Podcast, Users, FileText, Calendar, ShoppingBag, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    return (
        <div className="flex min-h-screen w-full">
            <aside className="hidden w-64 flex-col border-r bg-background p-6 md:flex">
                <div className="mb-8 flex items-center justify-start">
                    <Link href="/" className="flex items-center">
                        <img src="/progressive.lk-logo.svg" alt="Progressive.lk" className="h-6 w-auto invert dark:invert-0" />
                    </Link>
                </div>
                <nav className="flex flex-col gap-2">
                    <Link
                        href="/admin"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname === "/admin"
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/artists"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/artists")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Artists
                    </Link>
                    <Link
                        href="/admin/tracks"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/tracks")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Music className="h-4 w-4" />
                        Tracks
                    </Link>
                    <Link
                        href="/admin/podcasts"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/podcasts")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Podcast className="h-4 w-4" />
                        Podcasts
                    </Link>
                    <Link
                        href="/admin/genres"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/genres")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Mic2 className="h-4 w-4" /> {/* Assuming Mic2 for Genres based on original, or Music if preferred */}
                        Genres
                    </Link>
                    <Link
                        href="/admin/blog"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/blog")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <FileText className="h-4 w-4" />
                        Blog
                    </Link>
                    <Link
                        href="/admin/events"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/events")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Calendar className="h-4 w-4" />
                        Events
                    </Link>
                    <Link
                        href="/admin/shops"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/shops")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        Shops
                    </Link>
                    <Link
                        href="/admin/products"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/products")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Package className="h-4 w-4" />
                        Products
                    </Link>
                    <Link
                        href="/admin/users"
                        className={cn(
                            "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                            pathname.startsWith("/admin/users")
                                ? "bg-secondary text-primary"
                                : "text-muted-foreground"
                        )}
                    >
                        <Users className="h-4 w-4" />
                        Users
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
    )
}
