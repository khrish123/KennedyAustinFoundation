import { Metadata } from "next"
import Link from "next/link"
import { Users, MessageCircle, Shield, Heart, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Community",
  description: "A safe, moderated space to connect with others on a healing journey.",
}

const features = [
  {
    icon: MessageCircle,
    title: "Discussion Forums",
    description: "Topic-based spaces for grief, family, wellness, and more.",
  },
  {
    icon: Shield,
    title: "Moderated & Safe",
    description: "Trained moderators keep the space respectful and supportive.",
  },
  {
    icon: Heart,
    title: "Anonymous Posting",
    description: "Share at your own pace — by name or anonymously.",
  },
]

export default function CommunityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Users className="h-6 w-6 text-teal-700" />
            </div>
            <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">You&apos;re Not Alone</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Our community space is opening soon — a safe, moderated place to connect with others who
              understand. Be the first to know when it goes live.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild>
                <Link href="/register">
                  Create a Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/classes">Explore Classes</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                    <f.icon className="h-5 w-5 text-teal-700" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-6 text-center">
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Need support today?</h2>
            <p className="text-slate-700 mb-4">
              While we build the community space, our crisis line and contact form are open.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild variant="default">
                <a href="tel:909-808-6866">Call 909-808-6866</a>
              </Button>
              <Button asChild variant="outline">
                <Link href="/contact">Send a Message</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
