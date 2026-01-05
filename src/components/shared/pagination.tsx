"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"

interface PaginationProps {
    totalPages: number
    currentPage: number
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
    const searchParams = useSearchParams()
    const { replace } = useRouter()
    const [isPending, startTransition] = useTransition()

    const handlePageChange = (page: number) => {
        if (page < 1 || page > totalPages) return

        startTransition(() => {
            const params = new URLSearchParams(searchParams)
            params.set("page", page.toString())
            replace(`?${params.toString()}`)
        })
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1 || isPending}
            >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous Page</span>
            </Button>

            <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
            </div>

            <Button
                variant="outline"
                size="icon"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages || isPending}
            >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Page</span>
            </Button>
        </div>
    )
}
