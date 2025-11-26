"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createGenre, updateGenre, deleteGenre } from "@/app/actions/genres"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react"

interface Genre {
    id: string
    name: string
    slug: string
    parentId: string | null
    parent?: Genre | null
    _count?: {
        tracks: number
    }
}

interface GenreManagerProps {
    genres: Genre[]
}

export function GenreManager({ genres }: GenreManagerProps) {
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [editingGenre, setEditingGenre] = useState<Genre | null>(null)
    const [isPending, setIsPending] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsPending(true)
        const formData = new FormData(e.currentTarget)

        try {
            if (editingGenre) {
                await updateGenre(editingGenre.id, formData)
            } else {
                await createGenre(formData)
            }
            setIsSheetOpen(false)
            setEditingGenre(null)
            router.refresh()
        } catch (error) {
            console.error("Error saving genre:", error)
            alert("Failed to save genre")
        } finally {
            setIsPending(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this genre?")) return

        setIsPending(true)
        try {
            await deleteGenre(id)
            router.refresh()
        } catch (error) {
            console.error("Error deleting genre:", error)
            alert("Failed to delete genre")
        } finally {
            setIsPending(false)
        }
    }

    const openEdit = (genre: Genre) => {
        setEditingGenre(genre)
        setIsSheetOpen(true)
    }

    const openAdd = () => {
        setEditingGenre(null)
        setIsSheetOpen(true)
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">Genres</h2>
                <Button onClick={openAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Genre
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Slug</TableHead>
                            <TableHead>Parent Genre</TableHead>
                            <TableHead>Tracks</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {genres.map((genre) => (
                            <TableRow key={genre.id}>
                                <TableCell className="font-medium">{genre.name}</TableCell>
                                <TableCell>{genre.slug}</TableCell>
                                <TableCell>{genre.parent?.name || "-"}</TableCell>
                                <TableCell>{genre._count?.tracks || 0}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => openEdit(genre)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive"
                                            onClick={() => handleDelete(genre.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {genres.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                    No genres found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>{editingGenre ? "Edit Genre" : "Add Genre"}</SheetTitle>
                        <SheetDescription>
                            {editingGenre
                                ? "Make changes to the genre here."
                                : "Add a new genre to the system."}
                        </SheetDescription>
                    </SheetHeader>
                    <form onSubmit={handleSubmit} className="space-y-6 py-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={editingGenre?.name}
                                required
                                placeholder="e.g. Progressive House"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="parentId">Parent Genre (Optional)</Label>
                            <Select name="parentId" defaultValue={editingGenre?.parentId || "none"}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a parent genre" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">None</SelectItem>
                                    {genres
                                        .filter((g) => g.id !== editingGenre?.id) // Prevent self-parenting
                                        .map((g) => (
                                            <SelectItem key={g.id} value={g.id}>
                                                {g.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <SheetFooter>
                            <SheetClose asChild>
                                <Button variant="outline" type="button">Cancel</Button>
                            </SheetClose>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {editingGenre ? "Save Changes" : "Create Genre"}
                            </Button>
                        </SheetFooter>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    )
}
