import { getArtistById } from "@/server/actions/artists"
import { notFound } from "next/navigation"
import EditArtistForm from "./edit-artist-form"

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const artist = await getArtistById(id)

    if (!artist) {
        notFound()
    }

    return <EditArtistForm artist={artist} />
}
