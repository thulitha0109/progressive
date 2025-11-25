import { getArtists } from "@/app/actions/artists"
import TrackForm from "./track-form"

export default async function NewTrackPage() {
    const { artists } = await getArtists()
    return <TrackForm artists={artists} />
}
