"use client"

import { Loader2 } from "lucide-react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect } from "react"

export function NavigationLoader() {
    const pathname = usePathname()
    const searchParams = useSearchParams()

    useEffect(() => {
        // Aggressive cleanup sequence to handle race conditions where nprogress might re-add the class
        const removeBusyClass = () => document.documentElement.classList.remove("nprogress-busy")

        // 1. Immediate removal
        removeBusyClass()

        // 2. Short delay removal (100ms)
        const t1 = setTimeout(removeBusyClass, 100)

        // 3. Medium delay removal (500ms)
        const t2 = setTimeout(removeBusyClass, 500)

        // 4. Safety backup (2s) - in case of extremely slow or stuck transitions
        const t3 = setTimeout(removeBusyClass, 2000)

        return () => {
            clearTimeout(t1)
            clearTimeout(t2)
            clearTimeout(t3)
        }
    }, [pathname, searchParams])

    return (
        <div id="nav-loader" className="fixed inset-0 z-[9999] hidden items-center justify-center bg-background/50 backdrop-blur-sm md:!hidden">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    )
}
