import Link from "next/link"
import { LayoutDashboard, Mic2, Music, Podcast } from "lucide-react"

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full">
            <aside className="hidden w-64 flex-col border-r bg-background p-6 md:flex">
                <div className="mb-8 flex items-center gap-2 text-lg font-bold">
                    <Music className="h-6 w-6" />
                    <span>Admin Panel</span>
                </div>
                <nav className="flex flex-col gap-2">
                    <Link
                        href="/admin"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                    </Link>
                    <Link
                        href="/admin/artists"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <Mic2 className="h-4 w-4" />
                        Artists
                    </Link>
                    <Link
                        href="/admin/tracks"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <Music className="h-4 w-4" />
                        Tracks
                    </Link>
                    <Link
                        href="/admin/podcasts"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <Podcast className="h-4 w-4" />
                        Podcasts
                    </Link>
                    <Link
                        href="/admin/genres"
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                        <Music className="h-4 w-4" />
                        Genres
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
    )
}
