"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { setFeaturedTrack } from "@/app/actions/tracks"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface FeatureButtonProps {
    trackId: string
    isFeatured: boolean
}

export function FeatureButton({ trackId, isFeatured }: FeatureButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            await setFeaturedTrack(trackId)
        })
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleToggle}
            disabled={isPending || isFeatured}
            className={cn(isFeatured ? "text-yellow-500" : "text-muted-foreground hover:text-yellow-500")}
            title={isFeatured ? "Currently Featured" : "Set as Featured"}
        >
            <Star className={cn("h-4 w-4", isFeatured && "fill-current")} />
        </Button>
    )
}
