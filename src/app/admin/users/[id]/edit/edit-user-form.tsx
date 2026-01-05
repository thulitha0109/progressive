"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { updateUser } from "@/server/actions/users"
import { useRouter } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import type { User } from "@prisma/client"

export function EditUserForm({ user }: { user: User }) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        const name = formData.get("name") as string
        const role = formData.get("role") as string

        startTransition(async () => {
            try {
                await updateUser(user.id, { name, role })
                toast.success("User updated successfully")
                router.push("/admin/users")
                router.refresh()
            } catch (error) {
                toast.error("Failed to update user")
            }
        })
    }

    return (
        <form action={handleSubmit} className="space-y-8 max-w-lg">
            <div className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user.email || ""} disabled readOnly className="bg-muted" />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={user.name || ""} required />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select name="role" defaultValue={user.role || "USER"}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="USER">User</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="flex gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    )
}
