import { getArtists } from "@/server/actions/artists"
import { getTrack } from "@/server/actions/tracks"
import { getGenres } from "@/server/actions/genres"
import EditTrackForm from "./edit-track-form"
import { notFound } from "next/navigation"

export default async function EditTrackPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [track, artistsData, genres] = await Promise.all([
        getTrack(id),
        getArtists(1, 1000, undefined, 'a-z'),
        getGenres()
    ])

    if (!track) {
        notFound()
    }

    return <EditTrackForm track={track} artists={artistsData.artists} genres={genres} />
}
