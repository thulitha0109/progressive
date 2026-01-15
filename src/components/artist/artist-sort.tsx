"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useTransition } from "react"

export function ArtistSort() {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSort = (value: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            params.set("sort", value)
            if (params.get("page")) params.set("page", "1") // Reset page if it exists
            replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <Select
            defaultValue={searchParams.get("sort")?.toString() || "newest"}
            onValueChange={handleSort}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="a-z">Name (A-Z)</SelectItem>
                <SelectItem value="z-a">Name (Z-A)</SelectItem>
            </SelectContent>
        </Select>
    )
}
