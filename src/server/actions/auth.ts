"use server"

import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export async function signup(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!name || !email || !password) {
        return { error: "Missing required fields" }
    }

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return { error: "User already exists" }
    }

    const hashedPassword = await hash(password, 10)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        } as any,
    })

    // Automatically sign in after signup
    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            return { error: error.cause?.err?.message }
        }
        throw error
    }
}

export async function login(formData: FormData) {
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        return { success: true }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials." }
                default:
                    return { error: "Something went wrong." }
            }
        }
        throw error
    }
}

export async function logout() {
    await signOut({ redirect: false })
}
