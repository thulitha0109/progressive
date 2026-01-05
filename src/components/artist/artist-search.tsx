"use client"

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { useDebouncedCallback } from "use-debounce"

export function ArtistSearch() {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSearch = useDebouncedCallback((term: string) => {
        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            if (term) {
                params.set("search", term)
            } else {
                params.delete("search")
            }
            params.set("page", "1") // Reset page on search
            replace(`/artists?${params.toString()}`)
        })
    }, 300)

    return (
        <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search artists..."
                className="pl-8 w-full md:w-[300px]"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={searchParams.get("search")?.toString()}
            />
            {isPending && (
                <div className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            )}
        </div>
    )
}
