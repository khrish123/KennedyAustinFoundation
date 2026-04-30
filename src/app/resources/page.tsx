import { Metadata } from "next"
import Link from "next/link"
import {
  Phone, Shield, Heart, FileText, ExternalLink, AlertTriangle,
  BookOpen, Video, Download, ArrowRight, MessageCircle, LucideIcon
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getCrisisResources, getNonCrisisResources } from "@/lib/queries/resources"
import type { Resource } from "@/types/resource"

export const metadata: Metadata = {
  title: "Resources",
  description: "Crisis hotlines, helpful articles, guides, and external resources for mental health, grief, and domestic violence support.",
}

const fallbackCrisisResources = [
  {
    name: "Kennedy Austin Foundation Crisis Line",
    phone: "909-808-6866",
    description: "Our 24/7 crisis intervention hotline",
    primary: true,
  },
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "Free, confidential support 24/7",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "Free crisis counseling via text",
  },
  {
    name: "National Domestic Violence Hotline",
    phone: "1-800-799-7233",
    description: "24/7 support for DV survivors",
  },
  {
    name: "SAMHSA National Helpline",
    phone: "1-800-662-4357",
    description: "Mental health & substance abuse support",
  },
]

const fallbackResourceCategories = [
  {
    title: "Grief & Loss",
    icon: Heart,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    resources: [
      {
        title: "Understanding the Grief Process",
        type: "article",
        description: "Learn about the stages of grief and how to navigate your journey",
      },
      {
        title: "Coping with Loss: A Guide",
        type: "pdf",
        description: "Downloadable guide with practical coping strategies",
      },
      {
        title: "Supporting a Grieving Friend",
        type: "article",
        description: "How to be there for someone experiencing loss",
      },
      {
        title: "Grief in Children and Teens",
        type: "video",
        description: "Understanding how young people process loss",
      },
    ],
  },
  {
    title: "Domestic Violence",
    icon: Shield,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    resources: [
      {
        title: "Recognizing Signs of Abuse",
        type: "article",
        description: "Understanding different forms of domestic violence",
      },
      {
        title: "Safety Planning Guide",
        type: "pdf",
        description: "Step-by-step guide to creating a personal safety plan",
      },
      {
        title: "Legal Resources for Survivors",
        type: "link",
        description: "Information about restraining orders and legal protections",
      },
      {
        title: "Supporting a Survivor",
        type: "article",
        description: "How to help a friend or family member",
      },
    ],
  },
  {
    title: "Mental Wellness",
    icon: BookOpen,
    color: "text-emerald-600",
    bgColor: "bg-emerald-100",
    resources: [
      {
        title: "Stress Management Techniques",
        type: "article",
        description: "Practical strategies for managing daily stress",
      },
      {
        title: "Introduction to Mindfulness",
        type: "video",
        description: "Beginner-friendly meditation and mindfulness exercises",
      },
      {
        title: "Building Healthy Relationships",
        type: "article",
        description: "Communication skills and boundary setting",
      },
      {
        title: "Self-Care Toolkit",
        type: "pdf",
        description: "Worksheets and activities for self-care practice",
      },
    ],
  },
  {
    title: "Youth Resources",
    icon: BookOpen,
    color: "text-amber-600",
    bgColor: "bg-amber-100",
    resources: [
      {
        title: "Teen Mental Health Guide",
        type: "article",
        description: "Understanding and supporting teen mental health",
      },
      {
        title: "Bullying Prevention",
        type: "pdf",
        description: "Resources for dealing with bullying",
      },
      {
        title: "College & Career Planning",
        type: "link",
        description: "Resources for planning your future",
      },
      {
        title: "Peer Support Tips",
        type: "article",
        description: "How teens can support each other",
      },
    ],
  },
]

const externalLinks = [
  {
    name: "Mental Health America",
    url: "https://www.mhanational.org",
    description: "National nonprofit dedicated to mental health",
  },
  {
    name: "GriefShare",
    url: "https://www.griefshare.org",
    description: "Grief recovery support groups",
  },
  {
    name: "RAINN",
    url: "https://www.rainn.org",
    description: "Nation's largest anti-sexual violence organization",
  },
  {
    name: "The Jed Foundation",
    url: "https://www.jedfoundation.org",
    description: "Protecting emotional health of teens and young adults",
  },
]

function getTypeIcon(type: string) {
  switch (type) {
    case "article":
      return <FileText className="h-4 w-4" />
    case "pdf":
      return <Download className="h-4 w-4" />
    case "video":
      return <Video className="h-4 w-4" />
    case "link":
      return <ExternalLink className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

const CATEGORY_VISUALS: Record<string, { icon: LucideIcon; color: string; bgColor: string }> = {
  grief: { icon: Heart, color: "text-purple-600", bgColor: "bg-purple-100" },
  dv: { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100" },
  domestic_violence: { icon: Shield, color: "text-blue-600", bgColor: "bg-blue-100" },
  wellness: { icon: BookOpen, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  mental_health: { icon: BookOpen, color: "text-emerald-600", bgColor: "bg-emerald-100" },
  youth: { icon: BookOpen, color: "text-amber-600", bgColor: "bg-amber-100" },
  self_help: { icon: Heart, color: "text-rose-600", bgColor: "bg-rose-100" },
  therapy: { icon: BookOpen, color: "text-teal-600", bgColor: "bg-teal-100" },
}

function categoryVisual(slug: string) {
  return (
    CATEGORY_VISUALS[slug] || {
      icon: BookOpen,
      color: "text-slate-600",
      bgColor: "bg-slate-100",
    }
  )
}

function humanizeCategory(slug: string) {
  return slug
    .split("_")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

function groupByCategory(resources: Resource[]) {
  const map = new Map<string, Resource[]>()
  for (const r of resources) {
    const key = r.category || "other"
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(r)
  }
  return Array.from(map.entries())
}

export default async function ResourcesPage() {
  const [crisisFromDb, nonCrisisFromDb] = await Promise.all([
    getCrisisResources(),
    getNonCrisisResources(),
  ])

  const useDbCrisis = crisisFromDb.length > 0
  const useDbResources = nonCrisisFromDb.length > 0
  const groupedDb = useDbResources ? groupByCategory(nonCrisisFromDb) : []

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Crisis Banner */}
        <section className="bg-gradient-to-r from-rose-500 to-rose-600 text-white py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6" />
                <span className="font-medium">
                  If you&apos;re in crisis, help is available 24/7. You are not alone.
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href="tel:909-808-6866"
                  className="flex items-center gap-2 bg-white text-rose-600 px-4 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors shadow-warm"
                >
                  <Phone className="h-4 w-4" />
                  909-808-6866
                </a>
                <span className="hidden sm:inline">or call 988</span>
              </div>
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative gradient-sunrise py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200">Resources</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
                Help When You Need It
              </h1>
              <p className="mt-6 text-lg text-slate-700">
                Access crisis hotlines, helpful articles, guides, and external
                resources. Whether you need immediate help or want to learn more,
                we&apos;re here to support you on your journey toward healing.
              </p>
            </div>
          </div>
        </section>

        {/* Crisis Resources */}
        <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Crisis Hotlines</h2>
              <p className="text-slate-700 mt-2">
                Immediate help is just a call or text away - you matter to us
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(useDbCrisis
                ? crisisFromDb.map((r, i) => ({
                    name: r.title,
                    phone: r.phone || r.url || "",
                    description: r.description || "",
                    primary: i === 0,
                  }))
                : fallbackCrisisResources
              ).map((resource) => (
                <Card
                  key={resource.name}
                  className={`shadow-warm hover:shadow-warm-lg transition-all ${resource.primary ? "border-teal-400 bg-teal-50" : "border-slate-200 bg-white"}`}
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-slate-900">
                      <Phone className={`h-5 w-5 ${resource.primary ? "text-teal-700" : "text-teal-600"}`} />
                      {resource.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={`tel:${resource.phone.replace(/\D/g, "")}`}
                      className="text-2xl font-bold text-teal-700 hover:underline"
                    >
                      {resource.phone}
                    </a>
                    <p className="text-sm text-slate-600 mt-1">
                      {resource.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Resource Categories */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">Resource Library</h2>
              <p className="text-slate-700 mt-2">
                Articles, guides, and videos to support your journey toward healing
              </p>
            </div>
            <div className="space-y-12">
              {useDbResources
                ? groupedDb.map(([catSlug, items]) => {
                    const visual = categoryVisual(catSlug)
                    const Icon = visual.icon
                    return (
                      <div key={catSlug}>
                        <div className="flex items-center gap-3 mb-6">
                          <div className={`p-3 rounded-xl ${visual.bgColor} shadow-warm`}>
                            <Icon className={`h-6 w-6 ${visual.color}`} />
                          </div>
                          <h3 className="text-xl font-semibold text-slate-900">
                            {humanizeCategory(catSlug)}
                          </h3>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                          {items.map((r) => {
                            const card = (
                              <Card className="h-full shadow-warm hover:shadow-warm-lg hover-lift transition-all cursor-pointer border border-slate-200 bg-white">
                                <CardHeader className="pb-2">
                                  <div className="flex items-center gap-2 text-slate-600 mb-2">
                                    {getTypeIcon(r.type)}
                                    <span className="text-xs uppercase font-medium">
                                      {r.type}
                                    </span>
                                  </div>
                                  <CardTitle className="text-base text-slate-900">
                                    {r.title}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <CardDescription className="text-slate-600">
                                    {r.description}
                                  </CardDescription>
                                </CardContent>
                              </Card>
                            )
                            return r.url ? (
                              <a
                                key={r.id}
                                href={r.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                {card}
                              </a>
                            ) : (
                              <div key={r.id}>{card}</div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })
                : fallbackResourceCategories.map((category) => (
                    <div key={category.title}>
                      <div className="flex items-center gap-3 mb-6">
                        <div className={`p-3 rounded-xl ${category.bgColor} shadow-warm`}>
                          <category.icon className={`h-6 w-6 ${category.color}`} />
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900">
                          {category.title}
                        </h3>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        {category.resources.map((resource) => (
                          <Card
                            key={resource.title}
                            className="shadow-warm hover:shadow-warm-lg hover-lift transition-all cursor-pointer border border-slate-200 bg-white"
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center gap-2 text-slate-600 mb-2">
                                {getTypeIcon(resource.type)}
                                <span className="text-xs uppercase font-medium">
                                  {resource.type}
                                </span>
                              </div>
                              <CardTitle className="text-base text-slate-900">
                                {resource.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <CardDescription className="text-slate-600">
                                {resource.description}
                              </CardDescription>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))}
            </div>
          </div>
        </section>

        {/* External Links */}
        <section className="py-12 sm:py-16 bg-slate-50 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-900">External Resources</h2>
              <p className="text-slate-700 mt-2">
                Trusted organizations providing additional support
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {externalLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Card className="h-full shadow-warm hover:shadow-warm-lg hover-lift transition-all hover:border-teal-400 border border-slate-200 bg-white">
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2 text-slate-900">
                        {link.name}
                        <ExternalLink className="h-4 w-4 text-teal-700" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-slate-600">{link.description}</CardDescription>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chat CTA */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="bg-white border border-slate-200 shadow-warm-lg">
              <CardContent className="py-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-full bg-teal-100 flex items-center justify-center shadow-warm">
                      <MessageCircle className="h-7 w-7 text-teal-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">Need Someone to Talk To?</h3>
                      <p className="text-slate-600">
                        Our AI support assistant is available 24/7 for non-crisis support
                      </p>
                    </div>
                  </div>
                  <Button asChild size="lg" className="shadow-warm">
                    <Link href="/chat">
                      Start Chat
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Need Personal Support?
            </h2>
            <p className="mt-4 text-lg text-white/95 max-w-2xl mx-auto">
              Our team is here to help you find the right resources and support
              for your specific situation. You deserve to heal.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 shadow-warm font-semibold">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-semibold">
                <a href="tel:909-808-6866">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
