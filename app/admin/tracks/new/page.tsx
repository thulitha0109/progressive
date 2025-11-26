import { getArtists } from "@/app/actions/artists"
import { getGenres } from "@/app/actions/genres"
import TrackForm from "./track-form"

export default async function NewTrackPage() {
    const [artistsData, genres] = await Promise.all([
        getArtists(),
        getGenres()
    ])

    return <TrackForm artists={artistsData.artists} genres={genres} />
}
