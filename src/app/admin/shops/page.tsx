import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Plus, Pencil, Eye, ShoppingBag } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { deleteShop } from "@/server/actions/admin/shop"
import { DeleteButton } from "@/components/admin/delete-button"

export default async function AdminShopsPage() {
    const shops = await prisma.shop.findMany({
        orderBy: { name: "asc" },
        include: { _count: { select: { products: true, reviews: true } } }
    })

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold tracking-tight">Shops</h1>
                <Button asChild>
                    <Link href="/admin/shops/new">
                        <Plus className="mr-2 h-4 w-4" />
                        New Shop
                    </Link>
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead>Verified</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Reviews</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {shops.map((shop) => (
                            <TableRow key={shop.id}>
                                <TableCell className="font-medium flex items-center gap-2">
                                    <div className="h-8 w-8 rounded overflow-hidden bg-secondary">
                                        {shop.imageUrl ? (
                                            <div className="relative h-full w-full">
                                                <Image
                                                    src={shop.imageUrl}
                                                    alt={shop.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <ShoppingBag className="h-4 w-4 text-muted-foreground/50" />
                                            </div>
                                        )}
                                    </div>
                                    {shop.name}
                                </TableCell>
                                <TableCell>{shop.location || "Online"}</TableCell>
                                <TableCell>
                                    {shop.isVerified ? (
                                        <Badge className="bg-blue-500 hover:bg-blue-600">Verified</Badge>
                                    ) : (
                                        <Badge variant="outline">Unverified</Badge>
                                    )}
                                </TableCell>
                                <TableCell>{shop._count.products}</TableCell>
                                <TableCell>{shop._count.reviews}</TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end gap-2">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/shops/${shop.slug}`} target="_blank">
                                                <Eye className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/admin/shops/${shop.id}/edit`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <DeleteButton id={shop.id} action={deleteShop} />
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                        {shops.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                    No shops found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
