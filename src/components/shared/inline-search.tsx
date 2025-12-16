"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Calculator, Calendar, CreditCard, Settings, Smile, User, Search, Loader2 } from "lucide-react"
import { globalSearch, SearchResult } from "@/server/actions/search"
import { usePlayer } from "@/components/shared/player-context"

// Removed unused imports
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function InlineSearch() {
    const [open, setOpen] = React.useState(false)
    const [query, setQuery] = React.useState("")
    const [results, setResults] = React.useState<SearchResult[]>([])
    const [isPending, startTransition] = React.useTransition()
    const router = useRouter()
    const { playTrack } = usePlayer()

    React.useEffect(() => {
        if (!query) {
            setResults([])
            return
        }

        const timer = setTimeout(() => {
            startTransition(async () => {
                const data = await globalSearch(query)
                setResults(data)
                setOpen(true)
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleSelect = (result: SearchResult) => {
        setOpen(false)
        setQuery("")

        if (result.type === 'track' && result.audioUrl) {
            playTrack({
                id: result.id,
                title: result.title,
                audioUrl: result.audioUrl,
                artist: {
                    name: result.subtitle || "Unknown Artist",
                    imageUrl: result.image
                }
            })
        } else {
            router.push(result.url)
        }
    }

    return (
        <div className="relative w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                        if (e.target.value.length > 0) setOpen(true)
                    }}
                    onFocus={() => {
                        if (query.length > 0) setOpen(true)
                    }}
                    className="pl-8 bg-muted/40 border-none focus-visible:ring-1 focus-visible:ring-primary h-9 w-[200px] lg:w-[300px] transition-all"
                />
                {isPending && (
                    <div className="absolute right-2 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {open && query.length > 0 && (
                <div className="absolute top-full mt-2 w-[350px] bg-popover rounded-md border shadow-md animate-in fade-in-0 zoom-in-95 z-50 overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {results.length === 0 && !isPending ? (
                            <p className="p-4 text-sm text-muted-foreground text-center">No results found.</p>
                        ) : (
                            <div className="flex flex-col gap-1">
                                {results.map((result) => (
                                    <button
                                        key={`${result.type}-${result.id}`}
                                        onClick={() => handleSelect(result)}
                                        className="flex items-center gap-3 w-full p-2 rounded-sm hover:bg-accent hover:text-accent-foreground text-left transition-colors"
                                    >
                                        <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0 bg-secondary">
                                            {result.image ? (
                                                <img src={result.image} alt={result.title} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-[10px] font-bold">
                                                    {result.title[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="text-sm font-medium truncate">{result.title}</span>
                                            <span className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                                                <span className="bg-primary/10 text-primary px-1 rounded text-[10px] uppercase">
                                                    {result.type}
                                                </span>
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Close overlay to click away*/}
                    <div className="fixed inset-0 z-[-1]" onClick={() => setOpen(false)} />
                </div>
            )}
        </div>
    )
}
