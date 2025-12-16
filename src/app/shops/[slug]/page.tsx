import { notFound } from "next/navigation"
import { getShopBySlug } from "@/server/actions/shop"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Globe, Star, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default async function SingleShopPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const shop = await getShopBySlug(slug)

    if (!shop) {
        notFound()
    }

    const contactInfo = shop.contactInfo as any || {}

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Hero / Header - Standardized Design */}
            <div className="relative h-[400px] w-full overflow-hidden bg-muted">
                {shop.imageUrl ? (
                    <div className="absolute inset-0">
                        <img
                            src={shop.imageUrl}
                            alt={shop.name}
                            className="h-full w-full object-cover opacity-30 blur-sm"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                ) : (
                    <div className="absolute inset-0 bg-secondary">
                        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                    </div>
                )}

                <div className="container relative flex h-full flex-col justify-end px-4 md:px-6 pb-12">
                    <div className="flex items-end gap-6">
                        <div className="h-32 w-32 overflow-hidden rounded-full border-4 border-background bg-muted flex items-center justify-center shadow-xl shrink-0">
                            {shop.imageUrl ? (
                                <img
                                    src={shop.imageUrl}
                                    alt={shop.name}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                        <div className="mb-2">
                            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{shop.name}</h1>
                            <div className="flex items-center gap-2 text-muted-foreground mt-2">
                                <MapPin className="h-4 w-4" />
                                <span>{shop.location || "Online Store"}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-4 md:px-6 py-8 grid gap-8 lg:grid-cols-[1fr_300px]">
                {/* Main Content: Products */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Products</h2>
                        <span className="text-muted-foreground text-sm">{shop.products.length} Items</span>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {shop.products.map((product: any) => (
                            <Link key={product.id} href={`/shop/${product.slug}`} className="group">
                                <Card className="h-full border-none bg-secondary/10 hover:bg-secondary/20 transition-colors">
                                    <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center bg-secondary/50">
                                                <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                                            </div>
                                        )}
                                    </div>
                                    <CardContent className="p-4">
                                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{product.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3 h-10">
                                            {product.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-bold">LKR {Number(product.price).toLocaleString()}</span>
                                            {product.stock <= 0 && (
                                                <span className="text-xs text-destructive font-medium">Out of Stock</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>

                    {shop.products.length === 0 && (
                        <div className="text-center py-12 border border-dashed rounded-lg">
                            <p className="text-muted-foreground">No products available yet.</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Shop Info */}
                <div className="flex flex-col gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>About Store</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <p className="text-sm text-muted-foreground">
                                {shop.description}
                            </p>

                            <div className="flex flex-col gap-3 pt-4 border-t">
                                {contactInfo.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-4 w-4 text-primary" />
                                        <a href={`mailto:${contactInfo.email}`} className="hover:underline">{contactInfo.email}</a>
                                    </div>
                                )}
                                {contactInfo.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-4 w-4 text-primary" />
                                        <a href={`tel:${contactInfo.phone}`} className="hover:underline">{contactInfo.phone}</a>
                                    </div>
                                )}
                                {contactInfo.website && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Globe className="h-4 w-4 text-primary" />
                                        <a href={contactInfo.website} target="_blank" rel="noopener noreferrer" className="hover:underline">Visit Website</a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews Snippet (Future) */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Reviews
                                <Star className="h-4 w-4 fill-primary text-primary" />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <span className="text-2xl font-bold">{shop.reviews.length > 0 ? (shop.reviews.reduce((a: number, b: any) => a + b.rating, 0) / shop.reviews.length).toFixed(1) : "New"}</span>
                                <p className="text-xs text-muted-foreground">{shop.reviews.length} Customer Ratings</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
