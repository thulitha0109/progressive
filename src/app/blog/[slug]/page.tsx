import Link from "next/link"
import { getBlogPostBySlug } from "@/server/actions/blog"
import { notFound } from "next/navigation"
import { Calendar, User, ArrowLeft, Tag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function BlogPostPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const post = await getBlogPostBySlug(slug)

    if (!post) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero / Header */}
            <div className="relative h-[400px] w-full overflow-hidden bg-muted">
                {post.coverImage && (
                    <div className="absolute inset-0">
                        <img
                            src={post.coverImage}
                            alt={post.title}
                            className="h-full w-full object-cover opacity-40 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}
                <div className="container relative flex h-full flex-col justify-end px-4 md:px-6 pb-12">
                    <Button variant="ghost" asChild className="w-fit mb-6 pl-0 hover:bg-transparent hover:text-primary">
                        <Link href="/blog" className="flex items-center gap-2 text-muted-foreground">
                            <ArrowLeft className="h-4 w-4" />
                            Back to Blog
                        </Link>
                    </Button>

                    <div className="space-y-4 max-w-4xl">
                        {post.category && (
                            <Badge className="bg-primary text-primary-foreground hover:bg-primary/90">
                                {post.category.name}
                            </Badge>
                        )}
                        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
                            {post.title}
                        </h1>
                        <div className="flex items-center gap-6 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
                                    {post.author.image ? (
                                        <img src={post.author.image} alt={post.author.name || "Author"} className="h-full w-full object-cover" />
                                    ) : (
                                        <User className="h-4 w-4" />
                                    )}
                                </div>
                                <span className="font-medium text-foreground">{post.author.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    {post.publishedAt
                                        ? new Date(post.publishedAt).toLocaleDateString(undefined, { dateStyle: 'long' })
                                        : 'Draft'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-12">
                <div className="grid gap-12 lg:grid-cols-[1fr_300px]">
                    {/* Main Content */}
                    <article className="prose prose-lg prose-invert max-w-none">
                        {/* Simple rendering for now, can be enhanced with a markdown parser later */}
                        <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                            {post.content}
                        </div>
                    </article>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Tags */}
                        {post.tags.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg">Tags</h3>
                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
                                            <Tag className="h-3 w-3" />
                                            {tag.name}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Share or other widgets can go here */}
                    </div>
                </div>
            </div>
        </div>
    )
}
