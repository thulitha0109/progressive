import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    providers: [],
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnAdmin = nextUrl.pathname.startsWith("/admin")
            const isOnAuth = nextUrl.pathname.startsWith("/auth")

            if (isOnAdmin) {
                if (isLoggedIn) {
                    // Check for ADMIN role
                    if (auth.user.role !== "ADMIN") {
                        return Response.redirect(new URL("/", nextUrl))
                    }
                    return true
                }
                return false // Redirect unauthenticated users to login page
            }

            if (isOnAuth) {
                if (isLoggedIn) {
                    return Response.redirect(new URL("/", nextUrl))
                }
                return true
            }

            return true
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
                token.id = user.id || ""
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.role = (token.role as string) || "USER"
                session.user.id = token.sub || ""
            }
            return session
        },
    },
    pages: {
        signIn: "/auth/login",
    },
} satisfies NextAuthConfig
