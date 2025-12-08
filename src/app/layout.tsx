import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://progressive.lk"),
  title: {
    default: "Progressive.lk | The Future of Sound",
    template: "%s | Progressive.lk",
  },
  description: "Discover exclusive tracks, upcoming releases, and the artists behind the progressive sound of Sri Lanka.",
  keywords: ["progressive house", "techno", "electronic music", "sri lanka", "underground music"],
  authors: [{ name: "Progressive.lk" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Progressive.lk | The Future of Sound",
    description: "Discover exclusive tracks, upcoming releases, and the artists behind the progressive sound of Sri Lanka.",
    siteName: "Progressive.lk",
  },
  twitter: {
    card: "summary_large_image",
    title: "Progressive.lk | The Future of Sound",
    description: "Discover exclusive tracks, upcoming releases, and the artists behind the progressive sound of Sri Lanka.",
  },
  robots: {
    index: true,
    follow: true,
  },
};


import { PlayerProvider } from "@/components/shared/player-context"
import { Player } from "@/components/shared/player"
import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { auth } from "@/auth"
import "./globals.css";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <PlayerProvider>
            <div className="relative flex min-h-screen flex-col mx-auto max-w-[1400px] border-x shadow-2xl">
              <SiteHeader user={session?.user} />
              <main className="flex-1">{children}</main>
              <SiteFooter />
            </div>
            <Player />
          </PlayerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
