"use client"

import { signup } from "@/server/actions/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"
import { LiquidBackground } from "@/components/shared/liquid-background"
import { Music2 } from "lucide-react"

export default function SignupPage() {
    const router = useRouter()
    const [error, setError] = useState<string | null>(null)
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (formData: FormData) => {
        setError(null)
        startTransition(async () => {
            const result = await signup(formData)
            if (result?.error) {
                setError(result.error)
            } else if (result?.success) {
                // Force a full page reload to ensure session is updated
                window.location.href = "/profile"
            }
        })
    }

    return (
        <div className="w-full min-h-screen grid lg:grid-cols-2 animate-enter-fade-in">
            {/* Left: Form */}
            <div className="flex flex-col justify-center px-6 md:px-12 lg:px-24 py-12 bg-background">
                <div className="w-full max-w-sm mx-auto flex flex-col gap-8">
                    {/* Logo removed as requested */}

                    <div className="flex flex-col gap-2">
                        <h1 className="text-3xl font-bold tracking-tight">Join the Community</h1>
                        <p className="text-muted-foreground">
                            Enter your information to create an account
                        </p>
                    </div>

                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Max Robinson"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                            />
                        </div>
                        {error && (
                            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded text-center font-medium">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending ? "Creating account..." : "Create an account"}
                        </Button>
                    </form>

                    <div className="text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/auth/login" className="underline hover:text-primary font-medium">
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:flex items-center justify-center bg-background overflow-hidden">
                <LiquidBackground
                    imageUrl="/SVG-02.svg"
                    className="absolute inset-0 w-full h-full z-10"
                    objectFit="contain"
                />
            </div>
        </div>
    )
}
