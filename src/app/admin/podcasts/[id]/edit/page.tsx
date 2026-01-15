import { getPodcast } from "@/server/actions/podcasts"
import { getArtists } from "@/server/actions/artists"
import { getGenres } from "@/server/actions/genres"
import { notFound } from "next/navigation"
import EditPodcastForm from "./edit-podcast-form"

export default async function EditPodcastPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const [podcast, artistsData, genres] = await Promise.all([
        getPodcast(id),
        getArtists(1, 1000, undefined, 'a-z'), // Fetch all artists (or enough to cover list)
        getGenres()
    ])

    if (!podcast) {
        notFound()
    }

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">Edit Podcast</h1>
            <EditPodcastForm podcast={podcast} artists={artistsData.artists} genres={genres} />
        </div>
    )
}
