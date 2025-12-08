import { getPodcast } from "@/server/actions/podcasts"
import { notFound } from "next/navigation"
import EditPodcastForm from "./edit-podcast-form"

export default async function EditPodcastPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const podcast = await getPodcast(id)

    if (!podcast) {
        notFound()
    }

    return (
        <div className="container max-w-2xl py-10">
            <h1 className="text-3xl font-bold mb-8">Edit Podcast</h1>
            <EditPodcastForm podcast={podcast} />
        </div>
    )
}
