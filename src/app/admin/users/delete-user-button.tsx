"use client"

import { deleteUser } from "@/server/actions/users"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function DeleteUserButton({ userId }: { userId: string }) {
    const [isPending, startTransition] = useTransition()
    const router = useRouter()
    const [open, setOpen] = useState(false)

    const handleDelete = () => {
        startTransition(async () => {
            const result = await deleteUser(userId)
            if (result.success) {
                toast.success("User deleted successfully")
                setOpen(false)
                router.refresh()
            } else {
                toast.error(result.error || "Failed to delete user")
            }
        })
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the user account and remove their data from our servers.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90" disabled={isPending}>
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
