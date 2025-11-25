"use client"

import { Artist } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { deleteArtist } from "@/app/actions/artists"
import { useTransition } from "react"
import { useRouter } from "next/navigation"

interface ArtistCardProps {
    artist: Artist
}

export function ArtistCard({ artist }: ArtistCardProps) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()

    const handleDelete = async () => {
        if (confirm("Are you sure you want to delete this artist?")) {
            startTransition(async () => {
                await deleteArtist(artist.id)
                router.refresh()
            })
        }
    }

    return (
        <div className="group relative rounded-lg border bg-card text-card-foreground shadow-sm p-6 overflow-hidden">
            <div className="flex items-center gap-4">
                {artist.imageUrl && (
                    <img
                        src={artist.imageUrl}
                        alt={artist.name}
                        className="h-12 w-12 rounded-full object-cover"
                    />
                )}
                <div>
                    <h3 className="text-lg font-semibold">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {artist.bio}
                    </p>
                </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button asChild variant="secondary" size="sm">
                    <Link href={`/admin/artists/${artist.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                    </Link>
                </Button>
                <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                </Button>
            </div>
        </div>
    )
}
