"use client"

import { useTransition } from "react"
import { Trash } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteButtonProps {
    id: string
    action: (id: string) => Promise<unknown>
}

export function DeleteButton({ id, action }: DeleteButtonProps) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            disabled={isPending}
            onClick={() => {
                startTransition(async () => {
                    await action(id)
                })
            }}
        >
            <Trash className="h-4 w-4" />
        </Button>
    )
}
