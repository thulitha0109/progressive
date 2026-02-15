"use client"

import Image from "next/image"
import { User } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns-tz"

export interface UpcomingItem {
  id: string
  title: string
  scheduledFor: Date | string
  kind: "TRACK" | "PODCAST"
  type: string | null
  label?: string | null
  timeZone?: string
  genre?: string | null
  artist: {
    name: string
    slug: string
    imageUrl?: string | null
  }
  sequence?: number
}

export function UpcomingTrackCard({ item }: { item: UpcomingItem }) {
  const timeZone = item.timeZone || "Asia/Colombo"
  const scheduledDate = new Date(item.scheduledFor)
  const formattedDate = format(scheduledDate, "MMM d", { timeZone })
  const formattedTime = format(scheduledDate, "h:mm a", { timeZone })

  return (
   <div className="group relative aspect-[1/1.1] sm:aspect-square overflow-hidden rounded-md bg-muted shadow-lg transition-all hover:shadow-xl isolate ring-1 ring-white/10 ring-inset">
      {/* Full Image Background */}
      {item.artist?.imageUrl ? (
        <Image
          src={item.artist.imageUrl}
          alt={item.artist.name}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-110 opacity-90 group-hover:opacity-100"
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 40vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
          <User className="h-20 w-20 text-muted-foreground/50" />
        </div>
      )}

      {/* Top Left Badge: Rotating Type/Kind Pill */}
      <div className="absolute top-2 left-2 z-20 perspective-[1000px]">
        {(item.type || item.kind) && (
          <div className="grid transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateX(180deg)]">
            {/* Front Face: Type (Default) */}
            <div
              className={cn(
                "col-start-1 row-start-1 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border text-background shadow-sm [backface-visibility:hidden]",
                item.type === "Warm" && "bg-yellow-500 border-yellow-400",
                item.type === "Drive" && "bg-orange-500 border-orange-400",
                item.type === "Peak" && "bg-red-500 border-red-400",
                !["Warm", "Drive", "Peak"].includes(item.type || "") &&
                  "bg-primary border-primary text-primary-foreground"
              )}
            >
              <span>{item.type || item.kind}</span>
            </div>

            {/* Back Face: Kind (Hover) */}
            <div
              className={cn(
                "col-start-1 row-start-1 flex items-center justify-center gap-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border shadow-sm [backface-visibility:hidden] [transform:rotateX(180deg)]",
                item.kind === "TRACK"
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-purple-600 border-purple-600 text-white"
              )}
            >
              <span>{item.kind || item.type}</span>
            </div>
          </div>
        )}
      </div>

      {/* Content Overlay - Scrim Gradient (Bottom) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent flex flex-col justify-end p-4 sm:p-5 pt-16">
        <div className="transform transition-transform duration-300 translate-y-2 group-hover:translate-y-0">
          <div className="mb-1.5 flex items-center gap-2">
            <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 shadow-sm">
              <span>{formattedDate}</span>
              <span className="w-0.5 h-0.5 rounded-full bg-white/60" />
              <span>{formattedTime}</span>
            </div>
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1 leading-tight mb-1">
            {item.title}
          </h3>

          <p className="text-sm text-gray-300 font-medium mb-2">
            {item.artist?.name || "Unknown Artist"}
          </p>

          {/* Label Display - Left Side Bottom */}
          {item.label && (
            <div className="flex justify-start">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 border border-white/30 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-sm">
                {item.label}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
