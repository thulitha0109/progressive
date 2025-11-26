import { getTrashedTracks } from "@/app/actions/tracks"
import { TrashManager } from "./trash-manager"

export default async function TrashPage() {
    const tracks = await getTrashedTracks()

    return (
        <div className="container py-10">
            <TrashManager tracks={tracks} />
        </div>
    )
}
