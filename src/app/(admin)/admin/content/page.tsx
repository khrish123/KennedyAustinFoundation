import { Metadata } from "next"
import Link from "next/link"
import {
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  ArrowRight,
  HeartHandshake,
  Heart,
  Calendar,
  Shield,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Content | Admin",
}

const sections = [
  {
    title: "Hero Slides",
    description: "Rotating hero carousel on the homepage with images, videos, and CTAs.",
    href: "/admin/content/hero-slides",
    icon: Sparkles,
    ready: true,
  },
  {
    title: "ECM Providers",
    description: "Managed Care Plan partners shown on /ecm. Toggle visibility per provider.",
    href: "/admin/content/ecm-providers",
    icon: HeartHandshake,
    ready: true,
  },
  {
    title: "FAQs",
    description: "Frequently asked questions shown on /faq.",
    href: "/admin/content/faqs",
    icon: HelpCircle,
    ready: true,
  },
  {
    title: "Resources",
    description: "Crisis hotlines, articles, PDFs, and external links shown on /resources.",
    href: "/admin/content/resources",
    icon: BookOpen,
    ready: true,
  },
  {
    title: "Daily Inspirations",
    description: "Rotating inspirational quotes shown across the site.",
    href: "/admin/content/daily-inspirations",
    icon: Sparkles,
    ready: true,
  },
  {
    title: "Blog Posts",
    description: "Articles, stories, and reflections published to /blog.",
    href: "/admin/content/blog",
    icon: FileText,
    ready: true,
  },
  {
    title: "Services",
    description: "Service offerings shown on the homepage and /services.",
    href: "/admin/content/services",
    icon: Shield,
    ready: true,
  },
  {
    title: "About — Values",
    description: "Core values shown on /about.",
    href: "/admin/content/about-values",
    icon: Heart,
    ready: true,
  },
  {
    title: "About — Milestones",
    description: "Timeline entries shown on /about.",
    href: "/admin/content/about-milestones",
    icon: Calendar,
    ready: true,
  },
]

export default function AdminContentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Content</h1>
        <p className="text-muted-foreground">
          Manage homepage slides, blog posts, resources, FAQs, and daily inspirations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const inner = (
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <s.icon className="h-5 w-5 text-teal-700" />
                  </div>
                  {!s.ready && (
                    <Badge variant="secondary" className="text-xs">
                      Coming soon
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg flex items-center gap-1">
                  {s.title}
                  {s.ready && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-teal-700 group-hover:translate-x-0.5 transition" />
                  )}
                </CardTitle>
                <CardDescription>{s.description}</CardDescription>
              </CardHeader>
            </Card>
          )

          if (s.ready) {
            return (
              <Link
                key={s.title}
                href={s.href}
                className="group block rounded-lg border bg-background hover:border-teal-300 hover:shadow-sm transition"
              >
                {inner}
              </Link>
            )
          }
          return (
            <div
              key={s.title}
              className="block rounded-lg border bg-background opacity-70"
            >
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
