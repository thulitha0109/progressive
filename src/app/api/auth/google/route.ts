import { signIn } from "@/auth";

export async function GET() {
    return await signIn("google", { redirectTo: "/auth/close-popup" });
}
