import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SessionAuthProvider } from "@/components/providers/session-provider"
import { NavBar } from "@/components/NavBar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MERN Auth App",
  description: "Full-stack authentication with Next.js, NextAuth, and MongoDB",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-[#1A202C] font-sans antialiased", inter.className)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SessionAuthProvider>
            <NavBar />
            <main className="flex min-h-[calc(100svh-64px)] flex-col items-center justify-center p-4">{children}</main>
          </SessionAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
