import Link from "next/link"
import { Calendar, MapPin, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Event } from "@/types"

interface UpcomingEventsProps {
  events: Event[]
}

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return {
    month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    time: d.toLocaleString("en-US", { hour: "numeric", minute: "2-digit" }),
  }
}

export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) return null

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-teal-50/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
          <div>
            <Badge className="mb-3 bg-rose-100 text-rose-800 border-rose-200">
              Save the Date
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Upcoming Events
            </h2>
            <p className="mt-2 text-slate-600">
              Workshops, gatherings, and community moments — come as you are
            </p>
          </div>
          <Button
            asChild
            variant="outline"
            className="mt-4 sm:mt-0 hover-lift border-slate-300"
          >
            <Link href="/events">
              View All Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const date = formatEventDate(event.date)
            return (
              <Card
                key={event.id}
                className="overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-100 shadow-warm bg-white"
              >
                {event.image_url ? (
                  // Flyers carry the details, so show the whole image instead of cropping it.
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt=""
                      aria-hidden
                      className="absolute inset-0 h-full w-full object-cover scale-110 blur-xl opacity-60"
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={event.image_url}
                      alt=""
                      className="relative h-full w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="h-56 w-full bg-gradient-to-br from-teal-100 via-amber-100 to-rose-100 flex items-center justify-center">
                    <Calendar className="h-10 w-10 text-teal-700" />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 min-w-[64px]">
                      <span className="text-xs font-bold text-rose-700">
                        {date.month}
                      </span>
                      <span className="text-2xl font-bold text-slate-900 leading-none">
                        {date.day}
                      </span>
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-snug text-slate-900">
                        {event.title}
                      </CardTitle>
                      <div className="mt-1 flex items-center text-xs text-slate-600">
                        {date.time}
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
                    <p className="text-sm text-slate-700 line-clamp-3 mb-4">
                      {event.description}
                    </p>
                  )}
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.id}`}>
                      {event.registration_required ? "Register" : "Learn More"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
