import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"

const geist = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Grandma santé | Admin Dashboard",
  description: "Healthcare administration panel for Grandma santé",
  generator: "Grandma santé.app",
  // icons: {
  //   icon: [
  //     { url: "/icon-light-32x32.png", media: "(prefers-color-scheme: light)" },
  //     { url: "/icon-dark-32x32.png", media: "(prefers-color-scheme: dark)" },
  //     { url: "/icon.svg", type: "image/svg+xml" },
  //   ],
  //   apple: "/apple-icon.png",
  // },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={cn(geist.className, geistMono.className, "antialiased bg-background min-h-screen")}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
