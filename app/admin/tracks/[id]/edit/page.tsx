import { getArtists } from "@/app/actions/artists"
import { getTrack } from "@/app/actions/tracks"
import { getGenres } from "@/app/actions/genres"
import EditTrackForm from "./edit-track-form"
import { notFound } from "next/navigation"

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [track, artistsData, genres] = await Promise.all([
        getTrack(id),
        getArtists(),
        getGenres()
    ])

    if (!track) {
        notFound()
    }

    return <EditTrackForm track={track} artists={artistsData.artists} genres={genres} />
}
