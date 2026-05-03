import { Metadata } from "next"
import { Calendar } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Badge } from "@/components/ui/badge"
import {
  getUpcomingPublishedEvents,
  getPastPublishedEvents,
} from "@/lib/queries/events"
import { EventsPageClient } from "./events-page-client"

export const metadata: Metadata = {
  title: "Events Calendar",
  description:
    "Upcoming events, workshops, support groups, toy and turkey drives, and community gatherings at the Kennedy Austin Foundation.",
}

export default async function EventsPage() {
  const [upcoming, past] = await Promise.all([
    getUpcomingPublishedEvents(),
    getPastPublishedEvents(50),
  ])

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-3 bg-teal-100 text-teal-800 border-teal-200">
                Save the Date
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Events &amp; Drives
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Workshops, support groups, toy and turkey drives, dinners, and
                community gatherings. Sign up for what speaks to you.
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-slate-500">
                <Calendar className="h-4 w-4" />
                {upcoming.length} upcoming · {past.length} past
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <EventsPageClient upcoming={upcoming} past={past} />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
