
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const params = await context.params
        const artistId = params.id

        // Check if already following
        const existingFollow = await prisma.user.findFirst({
            where: {
                id: session.user.id,
                followedArtists: {
                    some: {
                        id: artistId
                    }
                }
            }
        })

        if (existingFollow) {
            // Unfollow
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    followedArtists: {
                        disconnect: { id: artistId }
                    }
                }
            })
            return NextResponse.json({ followed: false })
        } else {
            // Follow
            await prisma.user.update({
                where: { id: session.user.id },
                data: {
                    followedArtists: {
                        connect: { id: artistId }
                    }
                }
            })
            return NextResponse.json({ followed: true })
        }

    } catch (error) {
        console.error("Follow error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ followed: false })
        }

        const params = await context.params
        const artistId = params.id

        const isFollowing = await prisma.user.findFirst({
            where: {
                id: session.user.id,
                followedArtists: {
                    some: {
                        id: artistId
                    }
                }
            }
        })

        return NextResponse.json({ followed: !!isFollowing })
    } catch (error) {
        console.error("Check follow error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
