import Link from "next/link"
import { getCategoryById } from "@/server/actions/blog"
import { updateCategory } from "@/server/actions/admin/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const category = await getCategoryById(id)

    if (!category) {
        notFound()
    }

    const updateCategoryWithId = updateCategory.bind(null, category.id)

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/blog/categories" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Category</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateCategoryWithId} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Category Name"
                                required
                                defaultValue={category.name}
                            />
                            <p className="text-xs text-muted-foreground">
                                Current slug: <span className="font-mono">{category.slug}</span>
                                {" "}(will update if name changes)
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Brief description of this category..."
                                className="min-h-[100px]"
                                defaultValue={category.description || ""}
                            />
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Update Category</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
