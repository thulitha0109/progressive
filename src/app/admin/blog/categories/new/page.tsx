import Link from "next/link"
import { createCategory } from "@/server/actions/admin/blog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export default function NewCategoryPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/blog/categories" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Categories
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">New Category</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Category Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={createCategory} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Category Name"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                A unique name for the category. Slug will be auto-generated.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                name="description"
                                placeholder="Brief description of this category..."
                                className="min-h-[100px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Optional description to help identify the category&apos;s purpose.
                            </p>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Create Category</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
