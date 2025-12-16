"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { Menu, Music2, User } from "lucide-react"
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

interface SiteHeaderProps {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
        role?: string | null
    }
}

export function SiteHeader({ user }: SiteHeaderProps) {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

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
        <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 animate-enter-slide-down border-b border-border/40">
            <div className="flex h-16 items-center px-4 md:px-8 max-w-[1400px] mx-auto">
                <div className="mr-8 hidden lg:flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <Music2 className="h-6 w-6 text-primary" />
                        <span className="hidden font-bold sm:inline-block">
                            Progressive.lk
                        </span>
                    </Link>
                    <nav className="flex items-center space-x-6 text-sm font-medium">
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
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button
                            variant="ghost"
                            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
                        >
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Toggle Menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="pr-0">
                        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                        <Link
                            href="/"
                            className="flex items-center"
                            onClick={() => setIsOpen(false)}
                        >
                            <Music2 className="mr-2 h-6 w-6 text-primary" />
                            <span className="font-bold">Progressive.lk</span>
                        </Link>
                        <div className="my-4 pb-10 pl-6">
                            <div className="flex flex-col space-y-3">
                                {routes.map((route) => (
                                    <Link
                                        key={route.href}
                                        href={route.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            "text-muted-foreground transition-colors hover:text-foreground",
                                            route.active && "text-foreground"
                                        )}
                                    >
                                        {route.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
                <div className="ml-auto flex items-center space-x-4">
                    <div className="w-full max-w-[200px] lg:max-w-xs md:max-w-[240px]">
                        <InlineSearch />
                    </div>

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
                                    Login
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
                        <ModeToggle />
                    </nav>
                </div>
            </div>
        </header>
    )
}
