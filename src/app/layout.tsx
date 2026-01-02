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
    default: "Progressive.lk | Ceylon EDM Culture",
    template: "%s | Progressive.lk",
  },
  description: "Enter the void that offers more than just fun: the history, the present and the future of the Sri Lankan EDM industry!",
  keywords: ["progressive house", "techno", "electronic music", "sri lanka", "underground music"],
  authors: [{ name: "Progressive.lk" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Progressive.lk | Ceylon EDM Culture",
    description: "Enter the void that offers more than just fun: the history, the present and the future of the Sri Lankan EDM industry!",
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
    title: "Progressive.lk | Ceylon EDM Culture",
    description: "Enter the void that offers more than just fun: the history, the present and the future of the Sri Lankan EDM industry!",
    images: ["/socialicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/PFavicon.png',
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
          forcedTheme="dark"
          enableSystem={false}
        >
          <Providers session={session}>
            <PlayerProvider>
              <div className="relative flex min-h-screen flex-col mx-auto max-w-[1400px]">
                <SiteHeader user={session?.user} />
                <main className="flex-1">{children}</main>
                <SiteFooter />
              </div>
              <Player />
              <Toaster />
            </PlayerProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
import { Toaster } from "@/components/ui/sonner"
import { Providers } from "@/components/shared/providers"
