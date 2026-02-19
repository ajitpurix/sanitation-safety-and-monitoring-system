import React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/lib/auth-context"

import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SafeEntry - Sanitation Safety Monitor",
  description:
    "Municipal Corporation Sanitation Safety & Monitoring System for sewer and manhole entry risk assessment",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
