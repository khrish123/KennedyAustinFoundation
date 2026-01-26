import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/layout/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Kennedy Austin Foundation | Crisis Intervention & Family Support",
    template: "%s | Kennedy Austin Foundation",
  },
  description:
    "Supporting youth and families through the traumas of life and loss. Free crisis intervention, grief counseling, domestic violence support, and wellness classes in Pomona, CA.",
  keywords: [
    "crisis intervention",
    "grief counseling",
    "domestic violence support",
    "family support",
    "youth programs",
    "wellness classes",
    "Pomona California",
    "mental health",
    "therapy",
    "self-help",
  ],
  authors: [{ name: "Kennedy Austin Foundation" }],
  creator: "Kennedy Austin Foundation",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kennedyaustinfoundation.org",
    siteName: "Kennedy Austin Foundation",
    title: "Kennedy Austin Foundation | Crisis Intervention & Family Support",
    description:
      "Supporting youth and families through the traumas of life and loss. Free crisis intervention and support services.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kennedy Austin Foundation",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kennedy Austin Foundation",
    description: "Supporting youth and families through the traumas of life and loss.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
