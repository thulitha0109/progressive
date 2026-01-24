"use client"

import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface TypePillFilterProps {
    types: { label: string; value: string; colorClass?: string }[]
    selectedType: string
    basePath: string
    otherParams: Record<string, string | undefined>
}

export function TypePillFilter({
    types,
    selectedType,
    basePath,
    otherParams,
}: TypePillFilterProps) {
    const router = useRouter()

    const handleTypeClick = (typeValue: string) => {
        const isSelected = selectedType === typeValue
        const newType = isSelected ? "all" : typeValue

        const params = new URLSearchParams()
        if (newType !== "all") {
            params.set("type", newType)
        }

        // Add other existing params
        Object.entries(otherParams).forEach(([key, value]) => {
            if (value && value !== "" && value !== "all") {
                if (key === "status" && value === "published") return // default
                params.set(key, value)
            }
        })

        router.push(`${basePath}?${params.toString()}`)
    }

    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
            {types.map((type) => {
                const isSelected = selectedType === type.value
                return (
                    <button
                        key={type.value}
                        onClick={() => handleTypeClick(type.value)}
                        className={cn(
                            "px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider transition-all scale-95 hover:scale-100 border",
                            type.colorClass || "bg-muted text-muted-foreground border-transparent",
                            isSelected
                                ? "ring-2 ring-white/20 scale-100 shadow-lg"
                                : "opacity-80 hover:opacity-100"
                        )}
                    >
                        {type.label}
                    </button>
                )
            })}
        </div>
    )
}
