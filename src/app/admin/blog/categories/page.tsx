import Link from "next/link"
import { getCategories } from "@/server/actions/blog"
import { deleteCategory } from "@/server/actions/admin/blog"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Trash, ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function CategoriesPage() {
    const categories = await getCategories()

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" asChild>
                        <Link href="/admin/blog">
                            <ChevronLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
                </div>
                <Button asChild>
                    <Link href="/admin/blog/categories/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Category
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Posts</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {categories.map((category) => (
                            <TableRow key={category.id}>
                                <TableCell className="font-medium">{category.name}</TableCell>
                                <TableCell className="font-mono text-sm text-muted-foreground">
                                    {category.slug}
                                </TableCell>
                                <TableCell className="max-w-md truncate">
                                    {category.description || "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {(category as any)._count.posts}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/blog/categories/${category.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <form action={deleteCategory.bind(null, category.id)}>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-destructive"
                                                disabled={(category as any)._count.posts > 0}
                                                title={
                                                    (category as any)._count.posts > 0
                                                        ? "Cannot delete category with posts"
                                                        : "Delete category"
                                                }
                                            >
                                                <Trash className="h-4 w-4" />
                                            </Button>
                                        </form>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {categories.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No categories found. Create your first category to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
