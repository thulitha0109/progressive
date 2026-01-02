import { getTrashedPodcasts } from "@/server/actions/podcasts"
import { TrashManager } from "./trash-manager"

export default async function TrashPage() {
    const podcasts = await getTrashedPodcasts()

    return (
        <div className="container py-10">
            <TrashManager podcasts={podcasts} />
        </div>
    )
}
