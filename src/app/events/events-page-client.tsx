"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  EVENT_TYPE_LABELS,
  eventTypeBadgeClass,
  eventTypeLabel,
  type EventRecord,
} from "@/types/events"

interface EventsPageClientProps {
  upcoming: EventRecord[]
  past: EventRecord[]
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    year: d.getFullYear(),
    time: d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }),
    full: d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  }
}

function EventCard({ event }: { event: EventRecord }) {
  const date = formatDate(event.date)
  const typeBadge = eventTypeBadgeClass(event.event_type)
  const typeLabel = eventTypeLabel(event.event_type)
  return (
    <Link href={`/events/${event.id}`} className="block group">
      <Card className="h-full overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-100 shadow-warm bg-white">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.image_url}
            alt=""
            className="h-40 w-full object-cover"
          />
        ) : (
          <div className="h-40 w-full bg-gradient-to-br from-teal-100 via-amber-100 to-rose-100 flex items-center justify-center">
            <Calendar className="h-10 w-10 text-teal-700" />
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge className={`${typeBadge} text-xs border`}>{typeLabel}</Badge>
            <span className="text-xs text-muted-foreground">{date.year}</span>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center justify-center rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 min-w-[64px]">
              <span className="text-xs font-bold text-rose-700">{date.month}</span>
              <span className="text-2xl font-bold text-slate-900 leading-none">
                {date.day}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-snug text-slate-900 group-hover:text-teal-700 transition">
                {event.title}
              </CardTitle>
              <div className="mt-1 flex items-center text-xs text-muted-foreground flex-wrap">
                <span>{date.time}</span>
                {event.location && (
                  <>
                    <span className="mx-1.5">·</span>
                    <MapPin className="h-3 w-3 mr-0.5" />
                    <span className="truncate">{event.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {event.description && (
            <CardDescription className="line-clamp-3 mb-3">
              {event.description}
            </CardDescription>
          )}
          <span className="inline-flex items-center text-sm font-medium text-teal-700">
            View details
            <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-0.5 transition" />
          </span>
        </CardContent>
      </Card>
    </Link>
  )
}

export function EventsPageClient({ upcoming, past }: EventsPageClientProps) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming")
  const [filter, setFilter] = useState<string>("all")

  const visibleTypes = useMemo(() => {
    const list = tab === "upcoming" ? upcoming : past
    const types = new Set(list.map((e) => e.event_type || "general"))
    return Array.from(types)
  }, [tab, upcoming, past])

  const items = useMemo(() => {
    const list = tab === "upcoming" ? upcoming : past
    if (filter === "all") return list
    return list.filter((e) => (e.event_type || "general") === filter)
  }, [tab, filter, upcoming, past])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="inline-flex rounded-lg border bg-white p-1 self-start">
          <button
            type="button"
            onClick={() => {
              setTab("upcoming")
              setFilter("all")
            }}
            className={
              tab === "upcoming"
                ? "px-4 py-1.5 text-sm font-medium rounded-md bg-teal-600 text-white"
                : "px-4 py-1.5 text-sm font-medium rounded-md text-slate-700 hover:text-teal-700"
            }
          >
            Upcoming ({upcoming.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("past")
              setFilter("all")
            }}
            className={
              tab === "past"
                ? "px-4 py-1.5 text-sm font-medium rounded-md bg-teal-600 text-white"
                : "px-4 py-1.5 text-sm font-medium rounded-md text-slate-700 hover:text-teal-700"
            }
          >
            Past ({past.length})
          </button>
        </div>
      </div>

      {visibleTypes.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={
              filter === "all"
                ? "rounded-full px-3 py-1 text-xs font-medium bg-slate-900 text-white"
                : "rounded-full px-3 py-1 text-xs font-medium border bg-white text-slate-700 hover:border-teal-300"
            }
          >
            All
          </button>
          {visibleTypes.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilter(t)}
              className={
                filter === t
                  ? "rounded-full px-3 py-1 text-xs font-medium bg-slate-900 text-white"
                  : "rounded-full px-3 py-1 text-xs font-medium border bg-white text-slate-700 hover:border-teal-300"
              }
            >
              {EVENT_TYPE_LABELS[t] || t}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground mb-4">
              {tab === "upcoming"
                ? "No upcoming events right now. Check back soon."
                : "No past events to show."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/contact">Get notified</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((e) => (
            <EventCard key={e.id} event={e} />
          ))}
        </div>
      )}
    </div>
  )
}
