import Link from "next/link"
import { getShops } from "@/server/actions/shop"
import { Card, CardContent, CardTitle, CardHeader } from "@/components/ui/card"
import { MapPin, ShoppingBag } from "lucide-react"

export default async function ShopsPage() {
    const shops = await getShops()

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container px-4 md:px-6 py-12">
                <div className="flex flex-col gap-4 mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Shops Directory</h1>
                    <p className="text-muted-foreground text-lg">
                        Find the best rave gear, vinyls, and equipment in Sri Lanka.
                    </p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {shops.map((shop) => (
                        <Link key={shop.id} href={`/shops/${shop.slug}`} className="group">
                            <Card className="h-full overflow-hidden border-none bg-secondary/20 hover:bg-secondary/30 transition-colors flex flex-col">
                                <div className="aspect-video bg-muted relative overflow-hidden">
                                    {shop.imageUrl ? (
                                        <img
                                            src={shop.imageUrl}
                                            alt={shop.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-secondary">
                                            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                                        </div>
                                    )}
                                </div>
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="group-hover:text-primary transition-colors">
                                        {shop.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0 flex-1 flex flex-col gap-2">
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <MapPin className="h-4 w-4 text-primary" />
                                        <span>{shop.location || "Online"}</span>
                                    </div>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {shop.description}
                                    </p>

                                    {/* Preview Products */}
                                    {shop.products.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-border/50">
                                            <div className="text-xs font-medium text-muted-foreground mb-2">Popular Items</div>
                                            <div className="flex gap-2">
                                                {shop.products.map(p => (
                                                    <div key={p.id} className="h-8 w-8 rounded overflow-hidden bg-background">
                                                        {p.images[0] && (
                                                            <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover" />
                                                        )}
                                                    </div>
                                                ))}
                                                {shop.products.length >= 3 && (
                                                    <div className="h-8 w-8 flex items-center justify-center text-xs text-muted-foreground bg-secondary rounded">
                                                        + more
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {shops.length === 0 && (
                    <div className="text-center py-20 bg-secondary/10 rounded-lg">
                        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Shops Found</h3>
                        <p className="text-muted-foreground">Check back later for new store openings!</p>
                    </div>
                )}
            </div>
        </div>
    )
}
