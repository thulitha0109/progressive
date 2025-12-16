import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface PaginationProps {
    currentPage: number
    totalPages: number
    basePath: string
    totalItems?: number
    itemsPerPage?: number
    searchParams?: Record<string, string | number | undefined>
}

export function Pagination({
    currentPage,
    totalPages,
    basePath,
    totalItems,
    itemsPerPage = 10,
    searchParams = {},
}: PaginationProps) {
    // Don't render if there's only one page or no pages
    if (totalPages <= 1) return null

    const getPageUrl = (page: number) => {
        const params = new URLSearchParams()

        // Add existing search params
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.set(key, String(value))
            }
        })

        // Set page param
        if (page > 1) {
            params.set("page", page.toString())
        }

        const queryString = params.toString()
        return queryString ? `${basePath}?${queryString}` : basePath
    }

    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = []
        const maxVisible = 7 // Maximum number of page buttons to show

        if (totalPages <= maxVisible) {
            // Show all pages if total is less than max
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            // Always show first page
            pages.push(1)

            // Calculate start and end of middle pages
            let start = Math.max(2, currentPage - 1)
            const end = Math.min(totalPages - 1, currentPage + 1)

            // Add ellipsis and adjust start if needed
            if (start > 2) {
                pages.push("...")
            }

            // Ensure start isn't too small (redundant with initial max(2, ...))
            // Logic check: if currentPage is large, start is large.
            // If currentPage is small, start is 2.

            // Add middle pages
            for (let i = start; i <= end; i++) {
                pages.push(i)
            }

            // Add ellipsis if needed
            if (end < totalPages - 1) {
                pages.push("...")
            }

            // Always show last page
            pages.push(totalPages)
        }

        return pages
    }

    const pageNumbers = getPageNumbers()

    // Calculate item range for display
    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems || 0)

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
            {/* Items count info */}
            {totalItems !== undefined && (
                <p className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{startItem}</span> to{" "}
                    <span className="font-medium">{endItem}</span> of{" "}
                    <span className="font-medium">{totalItems}</span> items
                </p>
            )}

            {/* Pagination controls */}
            <nav
                className="flex items-center gap-1"
                role="navigation"
                aria-label="Pagination"
            >
                {/* Previous button */}
                <Link
                    href={getPageUrl(currentPage - 1)}
                    className={cn(
                        "inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                        currentPage <= 1 && "pointer-events-none opacity-50"
                    )}
                    aria-label="Go to previous page"
                    aria-disabled={currentPage <= 1}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Link>

                {/* Page numbers */}
                {pageNumbers.map((page, index) => {
                    if (page === "...") {
                        return (
                            <span
                                key={`ellipsis-${index}`}
                                className="px-2 text-muted-foreground"
                                aria-hidden="true"
                            >
                                ...
                            </span>
                        )
                    }

                    const pageNum = page as number
                    const isCurrentPage = pageNum === currentPage

                    return (
                        <Link
                            key={pageNum}
                            href={getPageUrl(pageNum)}
                            className={cn(
                                "inline-flex items-center justify-center h-9 w-9 rounded-md border transition-colors",
                                isCurrentPage
                                    ? "bg-primary text-primary-foreground border-primary pointer-events-none"
                                    : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                            )}
                            aria-label={`Go to page ${pageNum}`}
                            aria-current={isCurrentPage ? "page" : undefined}
                        >
                            {pageNum}
                        </Link>
                    )
                })}

                {/* Next button */}
                <Link
                    href={getPageUrl(currentPage + 1)}
                    className={cn(
                        "inline-flex items-center justify-center h-9 w-9 rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors",
                        currentPage >= totalPages && "pointer-events-none opacity-50"
                    )}
                    aria-label="Go to next page"
                    aria-disabled={currentPage >= totalPages}
                >
                    <ChevronRight className="h-4 w-4" />
                </Link>
            </nav>
        </div>
    )
}
