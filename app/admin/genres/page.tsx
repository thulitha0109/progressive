import { getGenres } from "@/app/actions/genres"
import { GenreManager } from "./genre-manager"

export default async function GenresPage() {
    const genres = await getGenres()

    return (
        <div className="container py-10">
            <GenreManager genres={genres} />
        </div>
    )
}
