import { getCategories } from "@/server/actions/blog"
import NewBlogPostForm from "./blog-form"

export default async function NewBlogPostPage() {
    const categories = await getCategories()

    return <NewBlogPostForm categories={categories} />
}
