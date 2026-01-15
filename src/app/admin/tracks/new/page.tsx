import { getArtists } from "@/server/actions/artists"
import { getGenres } from "@/server/actions/genres"
import TrackForm from "./track-form"

export default async function NewTrackPage() {
    const [artistsData, genres] = await Promise.all([
        getArtists(1, 1000, undefined, 'a-z'),
        getGenres()
    ])

    return <TrackForm artists={artistsData.artists} genres={genres} />
}
