import Link from "next/link"
import { updateArtist, getArtistById } from "@/app/actions/artists"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"

export default async function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const artist = await getArtistById(id)

    if (!artist) {
        notFound()
    }

    let socialProfiles = { instagram: "", twitter: "", soundcloud: "" }
    try {
        if (artist.socialProfiles) {
            socialProfiles = JSON.parse(artist.socialProfiles)
        }
    } catch (e) {
        console.error("Failed to parse social profiles", e)
    }

    const updateArtistWithId = updateArtist.bind(null, artist.id)

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <Button variant="ghost" asChild className="mb-4 pl-0 hover:bg-transparent hover:text-primary">
                    <Link href="/admin/artists" className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Artists
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Edit Artist</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Artist Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <form action={updateArtistWithId} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Artist Name"
                                required
                                defaultValue={artist.name}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                placeholder="Artist biography..."
                                className="min-h-[150px]"
                                required
                                defaultValue={artist.bio}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="imageUrl">Image URL</Label>
                            <Input
                                id="imageUrl"
                                name="imageUrl"
                                placeholder="https://example.com/image.jpg"
                                type="url"
                                defaultValue={artist.imageUrl || ""}
                            />
                            <p className="text-xs text-muted-foreground">
                                Provide a direct link to the artist's image.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="instagram">Instagram</Label>
                                <Input
                                    id="instagram"
                                    name="instagram"
                                    placeholder="https://instagram.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.instagram || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="twitter">Twitter</Label>
                                <Input
                                    id="twitter"
                                    name="twitter"
                                    placeholder="https://twitter.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.twitter || ""}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="soundcloud">SoundCloud</Label>
                                <Input
                                    id="soundcloud"
                                    name="soundcloud"
                                    placeholder="https://soundcloud.com/..."
                                    type="url"
                                    defaultValue={socialProfiles.soundcloud || ""}
                                />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit">Update Artist</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
