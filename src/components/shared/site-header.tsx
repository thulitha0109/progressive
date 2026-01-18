"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { Menu, Music2, User, Search } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle,
} from "@/components/ui/sheet"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/server/actions/auth"
import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InlineSearch } from "@/components/shared/inline-search"

import { useSession } from "next-auth/react"

interface SiteHeaderProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
    }
}

export function SiteHeader({ user: initialUser }: SiteHeaderProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const { data: session, status } = useSession()
    // Prefer session user if available, otherwise use initialUser (for SSR/first paint)
    // BUT if session is explicitly "unauthenticated", force user to null (logout state)
    // This prevents falling back to stale initialUser after client-side logout
    const user = status === "unauthenticated" ? null : (session?.user || initialUser)

    const routes = [
        // {
        //     href: "/",
        //     label: "Home",
        //     active: pathname === "/",
        // },
        {
            href: "/tracks",
            label: "Tracks",
            active: pathname === "/tracks" || pathname.startsWith("/tracks/"),
        },
        {
            href: "/artists",
            label: "Artists",
            active: pathname === "/artists" || pathname.startsWith("/artists/"),
        },
        {
            href: "/blog",
            label: "Blog",
            active: pathname === "/blog" || pathname.startsWith("/blog/"),
        },
        // {
        //     href: "/events",
        //     label: "Events",
        //     active: pathname === "/events" || pathname.startsWith("/events/"),
        // },
        // {
        //     href: "/shops",
        //     label: "Shops",
        //     active: pathname === "/shops" || pathname.startsWith("/shops/"),
        // },
        {
            href: "/podcasts",
            label: "Podcasts",
            active: pathname === "/podcasts" || pathname.startsWith("/podcasts/"),
        },
    ]

    return (
        <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 animate-enter-slide-down border-border/40 mb-0 md:mb-8">
            <div className="flex h-16 items-center px-4 md:px-8 max-w-[1400px] mx-auto justify-between">
                {/* Left: Logo (Mobile & Desktop) */}
                <div className="flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        {/* Mobile Icon Logo */}
                        <img src="/progressive.lk-icon.svg" alt="Progressive.lk" className="h-6 w-auto invert dark:invert-0 lg:hidden" />
                        {/* Desktop Full Logo */}
                        <img src="/progressive.lk-logo.svg" alt="Progressive.lk" className="h-4 w-auto invert dark:invert-0 hidden lg:block" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80",
                                    route.active ? "text-foreground" : "text-foreground/60"
                                )}
                            >
                                {route.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Right: Search, User, Menu */}
                <div className="flex items-center gap-2 md:gap-4">
                    <div className="w-full max-w-[200px] lg:max-w-xs md:max-w-[240px] hidden md:block">
                        <InlineSearch />
                    </div>
                    {/* Mobile Search Trigger Icon - Optional if InlineSearch is not responsive enough, 
                        but assuming InlineSearch handles itself or user implies search icon on mobile. 
                        If InlineSearch is hidden on mobile, we might need a distinct icon. 
                        For now, keeping desktop search logic and adding mobile specific if needed. 
                        Actually, user asked for "search icon" on right. 
                        The InlineSearch component usually has an icon. Let's see if we can use it or a trigger.
                        I'll use a Button with Search icon for mobile if InlineSearch is hidden.
                    */}
                    <Button variant="ghost" size="icon" className="md:hidden" asChild>
                        <Link href="/search">
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Link>
                    </Button>

                    <nav className="flex items-center gap-2">
                        {user ? (
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                            <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href="/profile">Profile</Link>
                                    </DropdownMenuItem>
                                    {user.role === "ADMIN" && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/admin/tracks">Dashboard</Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        className="text-destructive focus:text-destructive cursor-pointer"
                                        onClick={async () => {
                                            await logout()
                                            window.location.href = "/"
                                        }}
                                    >
                                        Log out
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden md:flex gap-2"
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex md:hidden"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        {/* <ModeToggle /> */}

                        <Sheet open={isOpen} onOpenChange={setIsOpen}>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden"
                                >
                                    <Menu className="h-6 w-6" />
                                    <span className="sr-only">Toggle Menu</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="right" className="pr-0"> {/* Changed side to right for mobile menu per common pattern, or keep left if preferred. User didn't specify menu side, just button position. sticking to left content but button is right. */}
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <Link
                                    href="/"
                                    className="flex items-center mb-6 pl-4"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <img src="/progressive.lk-logo.svg" alt="Progressive.lk" className="h-4 w-auto invert dark:invert-0" />
                                </Link>
                                <div className="my-4 pb-10 pl-6">
                                    <div className="flex flex-col space-y-4">
                                        {routes.map((route) => (
                                            <Link
                                                key={route.href}
                                                href={route.href}
                                                onClick={() => setIsOpen(false)}
                                                className={cn(
                                                    "text-lg font-medium transition-colors hover:text-primary",
                                                    route.active ? "text-primary" : "text-muted-foreground"
                                                )}
                                            >
                                                {route.label}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </nav>
                </div>
            </div>
        </header>
    )
}
