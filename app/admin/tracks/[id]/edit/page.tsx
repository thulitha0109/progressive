import { getArtists } from "@/app/actions/artists"
import { getTrack } from "@/app/actions/tracks"
import EditTrackForm from "./edit-track-form"
import { notFound } from "next/navigation"

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const track = await getTrack(id)
    const { artists } = await getArtists()

    if (!track) {
        notFound()
    }

    return <EditTrackForm track={track} artists={artists} />
}
