"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function ModeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="w-16 h-8" /> // Placeholder to prevent layout shift
    }

    const isDark = theme === "dark"

    return (
        <div
            className="relative flex h-8 w-16 cursor-pointer items-center rounded-full border bg-muted p-1 transition-colors hover:bg-muted/80"
            onClick={() => setTheme(isDark ? "light" : "dark")}
        >
            <div
                className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full bg-background shadow-sm transition-transform duration-300 ease-in-out",
                    isDark ? "translate-x-8" : "translate-x-0"
                )}
            >
                {isDark ? (
                    <Moon className="h-4 w-4 text-foreground" />
                ) : (
                    <Sun className="h-4 w-4 text-foreground" />
                )}
            </div>
            <span className="sr-only">Toggle theme</span>
        </div>
    )
}
