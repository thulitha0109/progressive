import { SessionProvider } from "next-auth/react"
import type { Session } from "next-auth"
import { UserActionsProvider } from "@/contexts/user-actions-context"

export function Providers({ children, session }: { children: React.ReactNode, session?: Session | null }) {
    return (
        <SessionProvider session={session}>
            {children}
        </SessionProvider>
    )
}
