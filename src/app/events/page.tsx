import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Calendar, Clock, MapPin, Users, ArrowRight, CalendarDays,
  ChevronLeft, ChevronRight
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Events Calendar",
  description: "Upcoming events, workshops, support groups, and community gatherings at the Kennedy Austin Foundation.",
}

// Sample events for display
const sampleEvents = [
  {
    id: "1",
    title: "Grief Support Group",
    description: "Weekly support group for those dealing with loss. A safe space to share and heal together.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    time: "6:00 PM - 7:30 PM",
    location: "Kennedy Austin Foundation Center, Pomona",
    type: "support_group",
    recurring: "Weekly",
    max_attendees: 20,
    registration_required: true,
  },
  {
    id: "2",
    title: "Mindfulness & Meditation Workshop",
    description: "Learn practical meditation techniques for stress relief and mental clarity. Beginners welcome.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    time: "10:00 AM - 12:00 PM",
    location: "Community Center, Claremont",
    type: "workshop",
    max_attendees: 30,
    registration_required: true,
  },
  {
    id: "3",
    title: "Family Fun Day",
    description: "A day of activities, games, and connection for families in our community. Food and refreshments provided.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
    time: "11:00 AM - 3:00 PM",
    location: "Ganesha Park, Pomona",
    type: "community",
    max_attendees: 100,
    registration_required: false,
  },
  {
    id: "4",
    title: "DV Awareness Seminar",
    description: "Educational seminar on recognizing and responding to domestic violence. For community members and professionals.",
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
    time: "2:00 PM - 4:00 PM",
    location: "Virtual (Zoom)",
    type: "seminar",
    max_attendees: 50,
    registration_required: true,
  },
  {
    id: "5",
    title: "Teen Support Circle",
    description: "Bi-weekly meeting for teens to connect, share experiences, and build coping skills together.",
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days from now
    time: "4:00 PM - 5:30 PM",
    location: "Kennedy Austin Foundation Center, Pomona",
    type: "support_group",
    recurring: "Bi-weekly",
    max_attendees: 15,
    registration_required: true,
  },
  {
    id: "6",
    title: "Volunteer Orientation",
    description: "Learn about volunteer opportunities at the Kennedy Austin Foundation. Make a difference in your community.",
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    time: "9:00 AM - 11:00 AM",
    location: "Kennedy Austin Foundation Center, Pomona",
    type: "orientation",
    max_attendees: 25,
    registration_required: true,
  },
  {
    id: "7",
    title: "Memorial & Remembrance Ceremony",
    description: "Annual ceremony to honor and remember loved ones. All are welcome to attend and participate.",
    date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), // 21 days from now
    time: "5:00 PM - 7:00 PM",
    location: "Community Garden, La Verna",
    type: "ceremony",
    max_attendees: null,
    registration_required: false,
  },
  {
    id: "8",
    title: "Parenting Skills Workshop",
    description: "Practical strategies for effective communication and positive parenting techniques.",
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days from now
    time: "6:30 PM - 8:00 PM",
    location: "Kennedy Austin Foundation Center, Pomona",
    type: "workshop",
    max_attendees: 20,
    registration_required: true,
  },
]

function getEventTypeColor(type: string) {
  switch (type) {
    case "support_group":
      return "bg-purple-100 text-purple-700"
    case "workshop":
      return "bg-blue-100 text-blue-700"
    case "community":
      return "bg-emerald-100 text-emerald-700"
    case "seminar":
      return "bg-amber-100 text-amber-700"
    case "ceremony":
      return "bg-pink-100 text-pink-700"
    case "orientation":
      return "bg-cyan-100 text-cyan-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

function getEventTypeLabel(type: string) {
  switch (type) {
    case "support_group":
      return "Support Group"
    case "workshop":
      return "Workshop"
    case "community":
      return "Community Event"
    case "seminar":
      return "Seminar"
    case "ceremony":
      return "Ceremony"
    case "orientation":
      return "Orientation"
    default:
      return type
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return {
    dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
    day: date.getDate(),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    year: date.getFullYear(),
    full: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }),
  }
}

// Generate calendar days for current month
function generateCalendarDays() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth()

  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startPadding = firstDay.getDay()

  const days = []

  // Add padding for days before the 1st
  for (let i = 0; i < startPadding; i++) {
    days.push({ day: null, isToday: false, hasEvent: false })
  }

  // Add days of the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const isToday = day === today.getDate()
    // Check if any sample event is on this day
    const hasEvent = sampleEvents.some(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day &&
             eventDate.getMonth() === month &&
             eventDate.getFullYear() === year
    })
    days.push({ day, isToday, hasEvent })
  }

  return days
}

export default async function EventsPage() {
  const supabase = await createClient()

  // Fetch events from database
  const { data: dbEvents } = await supabase
    .from("events")
    .select("*")
    .gte("date", new Date().toISOString())
    .order("date", { ascending: true })

  // Use database events if available, otherwise show samples
  const events = dbEvents && dbEvents.length > 0 ? dbEvents : sampleEvents

  const calendarDays = generateCalendarDays()
  const today = new Date()
  const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" })

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative gradient-sunrise py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">Events</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-800">
                Community Events & Workshops
              </h1>
              <p className="mt-6 text-lg text-slate-600">
                Join us for support groups, workshops, community gatherings, and
                special events. Most events are free and open to all community members.
                Connection is part of healing.
              </p>
            </div>
          </div>
        </section>

        {/* Calendar and Events Grid */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-white to-orange-50/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Mini Calendar */}
              <div className="lg:col-span-1">
                <Card className="shadow-warm border-amber-100">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{monthName}</CardTitle>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 text-center text-sm">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div key={day} className="py-2 text-muted-foreground font-medium">
                          {day}
                        </div>
                      ))}
                      {calendarDays.map((dayInfo, index) => (
                        <div
                          key={index}
                          className={`py-2 rounded-md relative ${
                            dayInfo.day === null
                              ? ""
                              : dayInfo.isToday
                              ? "bg-primary text-primary-foreground font-bold"
                              : "hover:bg-muted cursor-pointer"
                          }`}
                        >
                          {dayInfo.day}
                          {dayInfo.hasEvent && !dayInfo.isToday && (
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="flex-col items-start gap-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span>Events scheduled</span>
                    </div>
                  </CardFooter>
                </Card>

                {/* Quick Stats */}
                <Card className="mt-4 shadow-warm border-amber-100">
                  <CardHeader>
                    <CardTitle className="text-lg">This Month</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Upcoming Events</span>
                      <span className="font-semibold">{events.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Support Groups</span>
                      <span className="font-semibold">
                        {events.filter(e => e.type === "support_group").length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Workshops</span>
                      <span className="font-semibold">
                        {events.filter(e => e.type === "workshop").length}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Events List */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Upcoming Events</h2>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      View All
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {events.map((event) => {
                    const dateInfo = formatDate(event.date)
                    return (
                      <Card key={event.id} className="shadow-warm hover:shadow-warm-lg hover-lift transition-all border-amber-100">
                        <CardContent className="p-0">
                          <div className="flex flex-col sm:flex-row">
                            {/* Date Badge */}
                            <div className="sm:w-24 p-4 bg-gradient-to-b from-amber-50 to-orange-50 flex sm:flex-col items-center justify-center text-center border-b sm:border-b-0 sm:border-r border-amber-100">
                              <span className="text-sm text-slate-500 sm:mb-0 mr-2 sm:mr-0">
                                {dateInfo.dayName}
                              </span>
                              <span className="text-3xl font-bold text-teal-600">
                                {dateInfo.day}
                              </span>
                              <span className="text-sm text-slate-500 sm:mt-0 ml-2 sm:ml-0">
                                {dateInfo.month}
                              </span>
                            </div>

                            {/* Event Details */}
                            <div className="flex-1 p-4">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <Badge className={getEventTypeColor(event.type)}>
                                  {getEventTypeLabel(event.type)}
                                </Badge>
                                {event.recurring && (
                                  <Badge variant="outline">{event.recurring}</Badge>
                                )}
                                {!event.registration_required && (
                                  <Badge variant="secondary">Drop-in Welcome</Badge>
                                )}
                              </div>
                              <h3 className="text-lg font-semibold mb-2">{event.title}</h3>
                              <p className="text-muted-foreground text-sm mb-3">
                                {event.description}
                              </p>
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {event.time}
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.location}
                                </div>
                                {event.max_attendees && (
                                  <div className="flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Max {event.max_attendees}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Action */}
                            <div className="p-4 flex items-center">
                              <Button asChild>
                                <Link href={`/events/${event.id}`}>
                                  {event.registration_required ? "Register" : "Details"}
                                  <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {events.length === 0 && (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold">No upcoming events</h3>
                      <p className="text-muted-foreground mt-2">
                        Check back soon for new events and workshops.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="py-12 sm:py-16 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-bold text-slate-800">Types of Events</h2>
              <p className="text-slate-600 mt-2">
                We offer a variety of events to meet your needs
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("support_group")} >Support Groups</Badge>
                  <CardTitle className="mt-2">Peer Support</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>
                    Safe spaces to share experiences, receive support, and connect
                    with others facing similar challenges.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("workshop")}>Workshops</Badge>
                  <CardTitle className="mt-2 text-slate-800">Skill Building</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    Interactive sessions teaching practical skills for coping,
                    communication, and personal growth.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("community")}>Community Events</Badge>
                  <CardTitle className="mt-2 text-slate-800">Connection</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    Family-friendly gatherings and activities that bring our
                    community together.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("seminar")}>Seminars</Badge>
                  <CardTitle className="mt-2 text-slate-800">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    Educational presentations on mental health, wellness, and
                    community resources.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("ceremony")}>Ceremonies</Badge>
                  <CardTitle className="mt-2 text-slate-800">Remembrance</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    Special events honoring loved ones and marking important
                    moments of healing and hope.
                  </CardDescription>
                </CardContent>
              </Card>
              <Card className="shadow-warm border-amber-100 hover-lift transition-all">
                <CardHeader>
                  <Badge className={getEventTypeColor("orientation")}>Orientations</Badge>
                  <CardTitle className="mt-2 text-slate-800">Get Involved</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-slate-600">
                    Learn how to volunteer, donate, or participate in our
                    programs and services.
                  </CardDescription>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="gradient-hope py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Want to Host an Event?
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
              Partner with us to bring support and resources to your organization
              or community group. Together we can make a difference.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-white/90 shadow-warm">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/donate">
                  Support Our Events
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
