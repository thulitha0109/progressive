import { notFound } from "next/navigation"
import { getProductBySlug } from "@/server/actions/shop"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingCart, Check, Store } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"

export default async function SingleProductPage({
    params
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const product = await getProductBySlug(slug)

    if (!product) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background pb-24">
            <div className="container px-4 md:px-6 py-12">

                {/* Breadcrumb / Back */}
                <div className="mb-6">
                    <Link href={`/shops/${product.shop?.slug}`} className="text-muted-foreground hover:text-primary text-sm flex items-center gap-1 transition-colors">
                        <Store className="h-3 w-3" />
                        Back to {product.shop?.name}
                    </Link>
                </div>

                <div className="grid gap-10 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-secondary/20 rounded-lg overflow-hidden border border-border/50 relative">
                            {product.images[0] ? (
                                <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-secondary">
                                    <span className="text-muted-foreground">No image available</span>
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-4 gap-4">
                            {product.images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-md overflow-hidden border border-border/50 cursor-pointer hover:border-primary transition-colors">
                                    <Image
                                        src={img}
                                        alt={`${product.name} ${i}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="flex flex-col gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-2">{product.name}</h1>
                            <div className="text-2xl font-bold text-primary">
                                LKR {Number(product.price).toLocaleString()}
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <h3 className="font-semibold">Description</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        <Separator />

                        <div className="flex flex-col gap-4">
                            {product.stock > 0 ? (
                                <div className="flex items-center gap-2 text-green-500 text-sm font-medium">
                                    <Check className="h-4 w-4" />
                                    In Stock ({product.stock} available)
                                </div>
                            ) : (
                                <div className="text-destructive text-sm font-medium">
                                    Out of Stock
                                </div>
                            )}

                            <div className="flex gap-4">
                                <Button size="lg" className="flex-1 font-bold" disabled={product.stock <= 0}>
                                    Buy Now
                                </Button>
                                <Button size="lg" variant="outline" className="flex-1 font-bold" disabled={product.stock <= 0}>
                                    <ShoppingCart className="mr-2 h-4 w-4" />
                                    Add to Cart
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground text-center">
                                Sold by <strong>{product.shop?.name}</strong>. Secure checkout via Stripe.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
