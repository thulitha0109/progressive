"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/shared/mode-toggle"
import { Menu, Music2, User, Search, BookOpen, Radio, X, Home, Heart, ListMusic, UserCheck, LayoutDashboard, LogOut } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/server/actions/auth"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InlineSearch } from "@/components/shared/inline-search"
import { AnimatePresence, motion } from "framer-motion"

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

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = "unset"
        }
        return () => {
            document.body.style.overflow = "unset"
        }
    }, [isOpen])

    const routes = [
        {
            href: "/",
            label: "Home",
            active: pathname === "/",
            icon: Home,
        },
        {
            href: "/tracks",
            label: "Tracks",
            active: pathname === "/tracks" || pathname.startsWith("/tracks/"),
            icon: Music2,
        },
        {
            href: "/artists",
            label: "Artists",
            active: pathname === "/artists" || pathname.startsWith("/artists/"),
            icon: User,
        },
        {
            href: "/blog",
            label: "Blog",
            active: pathname === "/blog" || pathname.startsWith("/blog/"),
            icon: BookOpen,
        },
        {
            href: "/podcasts",
            label: "Podcasts",
            active: pathname === "/podcasts" || pathname.startsWith("/podcasts/"),
            icon: Radio,
        },
    ]

    return (
        <header className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 animate-enter-slide-down border-border/40 mb-0 md:mb-8">
            <div className="flex h-16 items-center px-4 md:pl-6 md:pr-4 justify-between">
                {/* Left: Logo (Mobile & Desktop) */}
                <div className="flex items-center">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        {/* Mobile Icon Logo */}
                        <img src="/progressive.lk-icon.svg" alt="Progressive.lk" className="h-6 w-auto invert dark:invert-0 lg:hidden" />
                        {/* Desktop Full Logo */}
                        <img src="/progressive.lk-logo.svg" alt="Progressive.lk" className="h-4 w-auto invert dark:invert-0 hidden lg:block cursor-pointer" />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex items-center space-x-6 text-sm font-medium">
                        {routes.map((route) => (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "transition-colors hover:text-foreground/80 cursor-pointer",
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
                                    <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                                        <Avatar className="h-8 w-8 border border-border">
                                            <AvatarImage src={user.image || ""} alt={user.name || ""} />
                                            <AvatarFallback>{user.name?.[0]?.toUpperCase() || "U"}</AvatarFallback>
                                        </Avatar>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 bg-[#1A1A1A] border-white/10 text-white p-2">
                                    <DropdownMenuLabel className="font-normal px-2 py-1.5">
                                        <div className="flex flex-col space-y-1">
                                            <p className="text-sm font-medium leading-none">{user.name}</p>
                                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator className="bg-white/10 my-1" />

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 focus:text-white rounded-md px-2 py-2">
                                        <Link href="/profile" className="flex items-center gap-3">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                            <span>Profile</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 focus:text-white rounded-md px-2 py-2">
                                        <Link href="/library/likes" className="flex items-center gap-3">
                                            <Heart className="h-4 w-4 text-muted-foreground" />
                                            <span>Likes</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 focus:text-white rounded-md px-2 py-2">
                                        <Link href="/library/playlists" className="flex items-center gap-3">
                                            <ListMusic className="h-4 w-4 text-muted-foreground" />
                                            <span>Playlists</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 focus:text-white rounded-md px-2 py-2">
                                        <Link href="/library/artists" className="flex items-center gap-3">
                                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                                            <span>Following</span>
                                        </Link>
                                    </DropdownMenuItem>

                                    {user.role === "ADMIN" && (
                                        <>
                                            <DropdownMenuSeparator className="bg-white/10 my-1" />
                                            <DropdownMenuItem asChild className="cursor-pointer focus:bg-white/5 focus:text-white rounded-md px-2 py-2">
                                                <Link href="/admin/tracks" className="flex items-center gap-3">
                                                    <LayoutDashboard className="h-4 w-4 text-primary" />
                                                    <span>Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        </>
                                    )}

                                    <DropdownMenuSeparator className="bg-white/10 my-1" />
                                    <DropdownMenuItem
                                        className="text-red-500 focus:text-red-500 focus:bg-red-500/10 cursor-pointer flex items-center gap-3 rounded-md px-2 py-2"
                                        onClick={async () => {
                                            await logout()
                                            window.location.href = "/"
                                        }}
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        ) : (
                            <Link href="/auth/login">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="hidden md:flex gap-2 cursor-pointer"
                                >
                                    <User className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="flex md:hidden cursor-pointer"
                                >
                                    <User className="h-5 w-5" />
                                </Button>
                            </Link>
                        )}
                        {/* <ModeToggle /> */}

                        {/* Toggle Button (morphing) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden relative z-[60] cursor-pointer"
                            onClick={() => setIsOpen(!isOpen)}
                        >
                            <AnimatePresence mode="wait">
                                {isOpen ? (
                                    <motion.div
                                        key="close"
                                        initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                        exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <X className="h-6 w-6" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="menu"
                                        initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                                        animate={{ rotate: 0, scale: 1, opacity: 1 }}
                                        exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Menu className="h-6 w-6" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <span className="sr-only">Toggle Menu</span>
                        </Button>

                        <AnimatePresence>
                            {isOpen && (
                                <>
                                    {/* Backdrop */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="fixed inset-0 z-[40] bg-zinc-950/80 backdrop-blur-md touch-none"
                                        onClick={() => setIsOpen(false)}
                                    />

                                    {/* Full Width Slide-Over Panel */}
                                    <motion.div
                                        initial={{ x: "100%" }}
                                        animate={{ x: 0 }}
                                        exit={{ x: "100%" }}
                                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                                        drag="x"
                                        dragConstraints={{ left: 0, right: 0 }}
                                        dragElastic={{ left: 0, right: 0.5 }}
                                        onDragEnd={(e, { offset, velocity }) => {
                                            if (offset.x > 50 || velocity.x > 200) setIsOpen(false)
                                        }}
                                        className="fixed inset-y-0 right-0 z-[50] w-full bg-zinc-950/95 backdrop-blur-3xl flex flex-col h-[100dvh]"
                                    >
                                        {/* Header Alignment Container */}
                                        <div className="flex items-center justify-between px-8 h-16 border-b border-white/5 shrink-0">
                                            {/* Left: Desktop SVG Logo (Original Colors) */}
                                            <div className="flex items-center gap-3">
                                                <img src="/progressive.lk-logo.svg" alt="Progressive.lk" className="h-5 w-auto" />
                                            </div>
                                            {/* Right: Placeholder for Close Button (z-60) */}
                                            <div className="w-10 h-10" />
                                        </div>

                                        <div className="flex flex-col px-8 pb-8 pt-10 overflow-y-auto">
                                            {/* Nav Links (Left Aligned, Big Icons, Small Text) */}
                                            <div className="flex flex-col items-start gap-6">
                                                {routes.map((route, index) => (
                                                    <motion.div
                                                        key={route.href}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                    >
                                                        <Link
                                                            href={route.href}
                                                            onClick={() => setIsOpen(false)}
                                                            className={cn(
                                                                "flex items-center gap-5 transition-colors group",
                                                                route.active ? "text-primary" : "text-zinc-400 hover:text-white"
                                                            )}
                                                        >
                                                            <div className={cn("p-3 rounded-full transition-colors", route.active ? "bg-primary text-black" : "bg-white/5 text-zinc-500 group-hover:text-white group-hover:bg-white/10")}>
                                                                {/* BIG ICON */}
                                                                <route.icon className="w-8 h-8 md:w-10 md:h-10" />
                                                            </div>
                                                            {/* SMAKK TEXT (Relative to icon) */}
                                                            <span className="text-2xl font-bold uppercase tracking-wide group-hover:translate-x-2 transition-transform">{route.label}</span>
                                                        </Link>
                                                    </motion.div>
                                                ))}
                                            </div>

                                            {/* Footer Area (Fit Content, No mt-auto) */}
                                            <div className="flex flex-col gap-8 pt-12">
                                                <div className="flex flex-col gap-6 w-full border-t border-white/10 pt-6">

                                                    <div className="flex items-end justify-between w-full">
                                                        {/* Left: Social Links (with White Icon First) */}
                                                        <div className="flex items-center gap-4">
                                                            {/* First: White Logo Icon */}
                                                            <Link href="/" onClick={() => setIsOpen(false)} className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors group">
                                                                <img src="/progressive.lk-icon.svg" alt="App" className="w-5 h-5 grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                                                            </Link>

                                                            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors group">
                                                                <svg className="w-5 h-5 text-zinc-500 group-hover:text-[#E4405F] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
                                                            </Link>
                                                            <Link href="#" className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-colors group">
                                                                <svg className="w-5 h-5 text-zinc-500 group-hover:text-[#1877F2] transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
                                                            </Link>
                                                        </div>

                                                        {/* Right: Profile */}
                                                        <div className="flex flex-col items-end gap-2">
                                                            {user ? (
                                                                <>
                                                                    <button
                                                                        onClick={async () => { await logout(); window.location.href = "/" }}
                                                                        className="text-xs font-bold uppercase tracking-widest text-red-500/60 hover:text-red-500 transition-colors mb-1"
                                                                    >
                                                                        Sign Out
                                                                    </button>
                                                                    <Link href="/profile" onClick={() => setIsOpen(false)} className="relative block">
                                                                        <Avatar className="h-12 w-12 border-2 border-white/10 hover:border-primary transition-all shadow-xl">
                                                                            <AvatarImage src={user.image || ""} />
                                                                            <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                                                        </Avatar>
                                                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-primary rounded-full border-[3px] border-zinc-950" />
                                                                    </Link>
                                                                </>
                                                            ) : (
                                                                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
                                                                    <User className="h-6 w-6 text-black" />
                                                                </Link>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                    </nav>
                </div>
            </div>
        </header>
    )
}
