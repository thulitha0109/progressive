import { getArtists } from "@/server/actions/artists"
import { getGenres } from "@/server/actions/genres"
import PodcastForm from "./podcast-form"

export default async function NewPodcastPage() {
    const [artistsData, genres] = await Promise.all([
        getArtists(1, 1000, undefined, 'a-z'),
        getGenres()
    ])

    return <PodcastForm artists={artistsData.artists} genres={genres} />
}
