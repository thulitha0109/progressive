"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter } from "next/navigation"

export function PodcastTypeFilter({
    selectedType,
    status = "published",
    genre = "all",
}: {
    selectedType?: string
    status?: string
    genre?: string
}) {
    const router = useRouter()
    const currentType = selectedType || "all"

    const handleValueChange = (value: string) => {
        const params = new URLSearchParams()
        if (value && value !== "all") {
            params.set("type", value)
        }
        if (status && status !== "published") {
            params.set("status", status)
        }
        if (genre && genre !== "all") {
            params.set("genre", genre)
        }

        router.push(`/podcasts?${params.toString()}`)
    }

    return (
        <Select value={currentType} onValueChange={handleValueChange}>
            <SelectTrigger className="w-full sm:w-[150px] bg-muted/40 border-border/50">
                <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Warm">Warm</SelectItem>
                <SelectItem value="Drive">Drive</SelectItem>
                <SelectItem value="Peak">Peak</SelectItem>
            </SelectContent>
        </Select>
    )
}
