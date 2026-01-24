import Link from "next/link"
import Image from "next/image"
import { getBlogPosts, getCategories } from "@/server/actions/blog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

export default async function BlogPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; category?: string }>
}) {
    const params = await searchParams
    const currentPage = Number(params.page) || 1
    const currentCategory = params.category || undefined

    // Fetch posts with category filter
    const { posts } = await getBlogPosts(currentPage, 12, 'published', currentCategory)
    const categories = await getCategories()

    return (
        <div className="min-h-screen bg-background pb-24 animate-enter-fade-in">
            <div className="container px-4 md:px-6 py-12">
                <div className="flex flex-col gap-4 mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Blog</h1>
                    <p className="text-muted-foreground text-lg">
                        News, updates, and stories from the progressive world.
                    </p>
                </div>

                {/* Categories Filter */}
                <div className="flex flex-wrap gap-2 mb-8">
                    <Link href="/blog">
                        <Badge
                            variant={!currentCategory ? "default" : "secondary"}
                            className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        >
                            All
                        </Badge>
                    </Link>
                    {categories.map(cat => (
                        <Link key={cat.id} href={`/blog?category=${cat.slug}`}>
                            <Badge
                                variant={currentCategory === cat.slug ? "default" : "outline"}
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                            >
                                {cat.name}
                            </Badge>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group">
                            <Card className="h-full overflow-hidden border-none bg-secondary/20 hover:bg-secondary/30 transition-colors flex flex-col p-0">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {post.coverImage ? (
                                        <Image
                                            src={post.coverImage}
                                            alt={post.title}
                                            fill
                                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-secondary">
                                            <span className="text-muted-foreground font-medium">No Image</span>
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3 w-3" />
                                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : 'Draft'}
                                        </span>
                                        {post.category && (
                                            <>
                                                <span>•</span>
                                                <span className="text-primary">{post.category.name}</span>
                                            </>
                                        )}
                                    </div>
                                    <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                                        {post.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1">
                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                        {post.excerpt || post.content.substring(0, 150)}...
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-20 text-muted-foreground">
                        No blog posts found{currentCategory ? ` in this category` : ''}.
                    </div>
                )}
            </div>
        </div>
    )
}
