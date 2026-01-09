"use client"

import { useEffect, useState } from "react"

export function ClientDate({ date, options }: { date: Date | string, options?: Intl.DateTimeFormatOptions }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null // Prevent hydration mismatch by rendering nothing initially or a fallback

    const d = new Date(date)
    return <>{d.toLocaleDateString(undefined, options)} {d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</>
}
