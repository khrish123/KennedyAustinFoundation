import { Metadata } from "next"
import Link from "next/link"
import { Sparkles, MessageCircle, Phone, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "AI Companion",
  description: "A supportive AI companion to help you reflect, journal, and find resources.",
}

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <Sparkles className="h-6 w-6 text-teal-700" />
            </div>
            <Badge variant="secondary" className="mb-4">Coming Soon</Badge>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">Your AI Companion</h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              A private, always-available companion to help you reflect, journal, and find the right
              resources. Launching soon for registered members.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
              <Button asChild>
                <Link href="/register">
                  Create a Free Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/journal">Try the Journal</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <Card className="border-rose-200 bg-rose-50">
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
                <Phone className="h-5 w-5 text-rose-700" />
              </div>
              <CardTitle className="text-rose-900">In Crisis Right Now?</CardTitle>
              <CardDescription className="text-rose-900/80">
                AI cannot replace a real person in a crisis. If you&apos;re in danger or having thoughts of
                suicide, reach a human right away.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row gap-3">
              <Button asChild variant="default" className="bg-rose-700 hover:bg-rose-800">
                <a href="tel:988">Call 988 — Lifeline</a>
              </Button>
              <Button asChild variant="outline" className="border-rose-300 text-rose-900">
                <a href="tel:909-808-6866">Call Foundation: 909-808-6866</a>
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100">
                <MessageCircle className="h-5 w-5 text-teal-700" />
              </div>
              <CardTitle>What the AI companion will do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-700">
                <li>• Listen and reflect what you share — at your pace, in your language.</li>
                <li>• Suggest journal prompts, classes, and resources that fit your situation.</li>
                <li>• Help you draft what you want to say to a counselor, family member, or friend.</li>
                <li>• Never share your conversations with anyone else.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
