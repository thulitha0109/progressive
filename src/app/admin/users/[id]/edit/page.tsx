import { getUser } from "@/server/actions/users"
import { notFound } from "next/navigation"
import { EditUserForm } from "./edit-user-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const user = await getUser(id)

    if (!user) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/admin/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
                    <p className="text-muted-foreground">
                        Update user details and permissions.
                    </p>
                </div>
            </div>

            <div className="border rounded-lg p-6 bg-card">
                <EditUserForm user={user} />
            </div>
        </div>
    )
}
