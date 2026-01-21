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
    default: "Progressive.lk | Ceylon Underground Void",
    template: "%s | Progressive.lk",
  },
  description: "The void beyond entertainment.Past, present and future of Ceylon underground music culture.",
  keywords: ["progressive house", "techno", "electronic music", "sri lanka", "underground music"],
  authors: [{ name: "Progressive.lk" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Progressive.lk | Ceylon Underground Void",
    description: "The void beyond entertainment.Past, present and future of Ceylon underground music culture.",
    siteName: "Progressive.lk",
    images: [
      {
        url: "/socialicon.png",
        width: 1200,
        height: 630,
        alt: "Progressive.lk",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Progressive.lk | Ceylon Underground Void",
    description: "The void beyond entertainment.Past, present and future of Ceylon underground music culture.",
    images: ["/socialicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/PFavicon.png',
  },
  manifest: '/manifest.json',
};


import { PlayerProvider } from "@/components/shared/player-context"
import { Player } from "@/components/shared/player"
import { SiteHeader } from "@/components/shared/site-header"
import { SiteFooter } from "@/components/shared/site-footer"
import { ThemeProvider } from "@/components/shared/theme-provider"
import { auth } from "@/auth"
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/shared/providers"
import ProgressProvider from "@/components/shared/progress-provider"
import { NavigationLoader } from "@/components/shared/navigation-loader"

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
          forcedTheme="dark"
          enableSystem={false}
        >
          <Providers session={session}>
            <ProgressProvider>
              <NavigationLoader />
              <PlayerProvider>
                <div className="relative flex min-h-screen flex-col mx-auto max-w-[1400px] pb-24 md:pb-28">
                  <SiteHeader user={session?.user} />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>
                <Player />
                <Toaster />
              </PlayerProvider>
            </ProgressProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
