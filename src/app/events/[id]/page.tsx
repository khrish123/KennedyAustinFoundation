import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  Calendar, Clock, MapPin, Users, ArrowLeft, Share2,
  CalendarPlus, CheckCircle
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Sample events for when DB is empty
const sampleEvents: Record<string, {
  id: string
  title: string
  description: string
  long_description: string
  date: string
  time: string
  location: string
  type: string
  recurring: string | null
  max_attendees: number | null
  registration_required: boolean
  what_to_expect: string[]
  who_should_attend: string[]
}> = {
  "1": {
    id: "1",
    title: "Grief Support Group",
    description: "Weekly support group for those dealing with loss. A safe space to share and heal together.",
    long_description: "Join our compassionate community for a weekly gathering designed to support those navigating the journey of grief. In this safe and confidential space, you'll have the opportunity to share your experiences, listen to others, and learn healthy coping strategies. Our trained facilitators guide each session with care and understanding.",
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    time: "6:00 PM - 7:30 PM",
    location: "Kennedy Austin Foundation Center, Pomona",
    type: "support_group",
    recurring: "Weekly",
    max_attendees: 20,
    registration_required: true,
    what_to_expect: [
      "Confidential and supportive environment",
      "Guided discussion facilitated by trained counselors",
      "Opportunity to share or simply listen",
      "Resource materials and coping strategies",
      "Light refreshments provided",
    ],
    who_should_attend: [
      "Anyone experiencing grief or loss",
      "Those who have lost a loved one",
      "People seeking peer support",
      "Family members supporting someone through grief",
    ],
  },
  "2": {
    id: "2",
    title: "Mindfulness & Meditation Workshop",
    description: "Learn practical meditation techniques for stress relief and mental clarity. Beginners welcome.",
    long_description: "Discover the power of mindfulness in this beginner-friendly workshop. You'll learn practical meditation techniques that you can incorporate into your daily life for reduced stress, improved focus, and greater peace of mind. No prior experience necessary - just bring an open mind and comfortable clothing.",
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    time: "10:00 AM - 12:00 PM",
    location: "Community Center, Claremont",
    type: "workshop",
    recurring: null,
    max_attendees: 30,
    registration_required: true,
    what_to_expect: [
      "Introduction to mindfulness concepts",
      "Guided breathing exercises",
      "Seated meditation practice",
      "Tips for building a daily practice",
      "Take-home resources",
    ],
    who_should_attend: [
      "Beginners curious about meditation",
      "Anyone experiencing stress or anxiety",
      "Those looking for healthy coping tools",
      "People wanting to improve focus and clarity",
    ],
  },
  "3": {
    id: "3",
    title: "Family Fun Day",
    description: "A day of activities, games, and connection for families in our community. Food and refreshments provided.",
    long_description: "Bring the whole family for a day of fun, connection, and community! This free event features activities for all ages, including games, crafts, and entertainment. It's a wonderful opportunity to meet other families, enjoy quality time together, and learn about the resources available through the Kennedy Austin Foundation.",
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    time: "11:00 AM - 3:00 PM",
    location: "Ganesha Park, Pomona",
    type: "community",
    recurring: null,
    max_attendees: 100,
    registration_required: false,
    what_to_expect: [
      "Games and activities for all ages",
      "Free food and refreshments",
      "Live entertainment",
      "Information booths about our services",
      "Prize drawings throughout the day",
    ],
    who_should_attend: [
      "Families with children of all ages",
      "Community members",
      "Anyone interested in learning about our services",
      "People looking to connect with neighbors",
    ],
  },
}

function getEventTypeColor(type: string) {
  switch (type) {
    case "support_group":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300"
    case "workshop":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
    case "community":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
    case "seminar":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
    case "ceremony":
      return "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
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
    default:
      return type
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return {
    full: date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
    short: date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const event = sampleEvents[id]

  return {
    title: event ? `${event.title} | Events` : "Event Not Found",
    description: event?.description,
  }
}

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Try to fetch from database first
  const { data: dbEvent } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  // Use DB event or fall back to sample
  const event = dbEvent || sampleEvents[id]

  if (!event) {
    notFound()
  }

  const dateInfo = formatDate(event.date)

  const whatToExpect = event.what_to_expect || [
    "Supportive environment",
    "Professional facilitation",
    "Valuable resources",
    "Community connection",
  ]

  const whoShouldAttend = event.who_should_attend || [
    "Anyone interested in this topic",
    "Community members",
    "Those seeking support",
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/events"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Events
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
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
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {event.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  {event.long_description || event.description}
                </p>
              </div>

              {/* Registration Card */}
              <Card className="lg:sticky lg:top-24 h-fit">
                <CardHeader className="text-center">
                  <div className="mx-auto w-20 h-20 rounded-xl bg-primary/10 flex flex-col items-center justify-center mb-2">
                    <span className="text-2xl font-bold text-primary">
                      {new Date(event.date).getDate()}
                    </span>
                    <span className="text-xs text-primary uppercase">
                      {new Date(event.date).toLocaleDateString("en-US", { month: "short" })}
                    </span>
                  </div>
                  <CardTitle>{dateInfo.full}</CardTitle>
                  <CardDescription>{event.time}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.registration_required ? (
                    <Button className="w-full" size="lg">
                      Register Now
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" variant="secondary">
                      No Registration Required
                    </Button>
                  )}
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                      <CalendarPlus className="mr-2 h-4 w-4" />
                      Add to Calendar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Separator />
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                      <span>{event.time}</span>
                    </div>
                    {event.max_attendees && (
                      <div className="flex items-start gap-3">
                        <Users className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        <span>Limited to {event.max_attendees} attendees</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* What to Expect */}
                <Card>
                  <CardHeader>
                    <CardTitle>What to Expect</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {whatToExpect.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Who Should Attend */}
                <Card>
                  <CardHeader>
                    <CardTitle>Who Should Attend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {whoShouldAttend.map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {/* Location */}
                <Card>
                  <CardHeader>
                    <CardTitle>Location</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{event.location}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {event.location.includes("Virtual")
                            ? "Join from anywhere! Link will be sent upon registration."
                            : "Parking available on-site. The venue is wheelchair accessible."}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact */}
                <Card>
                  <CardHeader>
                    <CardTitle>Questions?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions about this event, please don&apos;t hesitate to reach out.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" asChild>
                        <Link href="/contact">Contact Us</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <a href="tel:909-808-6866">Call 909-808-6866</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
