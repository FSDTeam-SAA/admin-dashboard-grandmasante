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
  icons: {
    icon: [
      { url: "/logo.png", sizes: "any" },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark h-full">
      <body className={cn(geist.className, geistMono.className, "min-h-dvh overflow-x-hidden antialiased bg-background")}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  )
}
