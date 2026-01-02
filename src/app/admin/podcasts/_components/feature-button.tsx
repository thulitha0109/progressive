"use client"

import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"
import { setFeaturedPodcast } from "@/server/actions/podcasts"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface FeatureButtonProps {
    podcastId: string
    isFeatured: boolean
}

export function FeatureButton({ podcastId, isFeatured }: FeatureButtonProps) {
    const [isPending, startTransition] = useTransition()

    const handleToggle = () => {
        startTransition(async () => {
            await setFeaturedPodcast(podcastId)
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
