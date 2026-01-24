import { Mail } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ContactPage() {
    return (
        <div className="container py-10 px-4 md:px-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold tracking-tight mb-4">Contact Us</h1>
                <p className="text-muted-foreground mb-12">
                    Get in touch with the Progressive.lk team. We&apos;d love to hear from you!
                </p>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Mail className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Email</CardTitle>
                                    <CardDescription>Send us a message anytime</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <a href="mailto:info@progressive.lk" className="text-primary hover:underline">
                                info@progressive.lk
                            </a>
                        </CardContent>
                    </Card>

                    {/* <Card>
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Phone className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Phone</CardTitle>
                                    <CardDescription>Call us during business hours</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <a href="tel:+94112345678" className="text-primary hover:underline">
                                +94 11 234 5678
                            </a>
                        </CardContent>
                    </Card> */}

                    {/* <Card className="md:col-span-2">
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <MapPin className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <CardTitle>Address</CardTitle>
                                    <CardDescription>Visit our office</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">
                                123 Music Street<br />
                                Colombo 03<br />
                                Sri Lanka
                            </p>
                        </CardContent>
                    </Card> */}
                </div>

                <div className="mt-12 p-6 bg-muted/20 rounded-lg">
                    <h2 className="text-2xl font-semibold mb-4">For Artists</h2>
                    <p className="text-muted-foreground">
                        If you&apos;re an artist interested in featuring your music on Progressive.lk,
                        please email us at{" "}
                        <a href="mailto:artists@progressive.lk" className="text-primary hover:underline">
                            artists@progressive.lk
                        </a>{" "}
                        with your portfolio and we&apos;ll get back to you as soon as possible.
                    </p>
                </div>
            </div>
        </div>
    )
}
