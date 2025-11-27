import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // spaces to hyphens
    .replace(/[^\w\-]+/g, '')       // remove special chars
    .replace(/\-\-+/g, '-')         // collapse multiple hyphens
    .replace(/^-+/, '')             // trim hyphens from start
    .replace(/-+$/, '')             // trim hyphens from end
}
