import { getBlogPostById, getCategories } from "@/server/actions/blog"
import { notFound } from "next/navigation"
import EditBlogPostForm from "./edit-form"

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const [post, categories] = await Promise.all([
        getBlogPostById(id),
        getCategories()
    ])

    if (!post) {
        notFound()
    }

    return <EditBlogPostForm post={post} categories={categories} />
}
