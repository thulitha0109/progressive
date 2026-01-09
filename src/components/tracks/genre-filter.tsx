"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Genre } from "@prisma/client"

interface GenreFilterProps {
    genres: Genre[]
    selectedGenreId: string
    status: string
    basePath?: string
    allowTypes?: boolean
}

export function GenreFilter({ genres, selectedGenreId, status, basePath = "/tracks", allowTypes = false }: GenreFilterProps) {
    const router = useRouter()

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams()
        if (status) params.set("status", status)
        if (value && value !== "all") params.set("genre", value)

        // Note: This filter currently resets Type if it's not passed/handled, 
        // effectively resetting to just Status + Genre. 
        // For purely Genre filtering this is expected behavior in this app's pattern.

        router.push(`${basePath}?${params.toString()}`)
    }

    return (
        <Select value={selectedGenreId} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full h-[42px] bg-background/50 backdrop-blur-sm border-input">
                <SelectValue placeholder="Filter by genre" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Genres</SelectItem>
                {genres.filter((g) => !g.parentId).map((parent) => (
                    <div key={parent.id}>
                        <SelectItem value={parent.id} className="font-semibold">
                            {parent.name}
                        </SelectItem>
                        {genres
                            .filter((g) => g.parentId === parent.id)
                            .map((sub) => (
                                <SelectItem key={sub.id} value={sub.id} className="pl-6 text-muted-foreground">
                                    {sub.name}
                                </SelectItem>
                            ))
                        }
                    </div>
                ))}
            </SelectContent>
        </Select>
    )
}
