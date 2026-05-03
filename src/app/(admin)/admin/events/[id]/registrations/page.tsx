import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ListChecks, Calendar, Users } from "lucide-react"
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
  getEventById,
  getRegistrationsForEvent,
} from "@/lib/queries/events"
import { eventTypeLabel } from "@/types/events"
import { RegistrationRow } from "./registration-row"

export const metadata: Metadata = {
  title: "Event registrations | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminEventRegistrationsPage({ params }: PageProps) {
  const { id } = await params
  const event = await getEventById(id)
  if (!event) notFound()

  const { registrations, tableMissing } = await getRegistrationsForEvent(id)

  const counts = {
    total: registrations.filter((r) => r.status !== "canceled").length,
    pending: registrations.filter((r) => r.status === "pending").length,
    confirmed: registrations.filter(
      (r) => r.status === "confirmed" || r.status === "approved"
    ).length,
    waitlist: registrations.filter((r) => r.status === "waitlist").length,
  }

  const totalChildren = registrations
    .filter((r) => r.status !== "canceled")
    .reduce((sum, r) => sum + (r.children?.length || 0), 0)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/events/${id}/edit`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to event
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ListChecks className="h-7 w-7" />
              Registrations
            </h1>
            <p className="text-muted-foreground">
              {event.title} · {eventTypeLabel(event.event_type)}
            </p>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(event.date).toLocaleString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/events/${id}`} target="_blank" rel="noopener noreferrer">
              View public page
            </Link>
          </Button>
        </div>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/013_events_extend.sql
              </code>{" "}
              in the Supabase SQL editor first.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {event.registration_type === "none" && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-base text-amber-900">
              Online registration is off
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              This event has registration set to &quot;None&quot; — no public
              sign-up form is shown. Set a registration mode in the event editor
              to start collecting signups.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total signups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            {event.max_attendees && (
              <p className="text-xs text-muted-foreground">
                of {event.max_attendees} max
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {counts.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {counts.confirmed}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Waitlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {counts.waitlist}
            </div>
          </CardContent>
        </Card>
      </div>

      {event.registration_type === "toy_request" && totalChildren > 0 && (
        <Card className="bg-rose-50 border-rose-200">
          <CardContent className="flex items-center gap-3 py-3">
            <Users className="h-5 w-5 text-rose-700" />
            <div className="text-sm text-rose-900">
              <strong>{totalChildren}</strong>{" "}
              {totalChildren === 1 ? "child" : "children"} registered for toys
              across all active signups.
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {registrations.length === 0 && !tableMissing && (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center">
              <ListChecks className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No signups yet. Once visitors fill out the public form,
                they&apos;ll appear here.
              </p>
            </CardContent>
          </Card>
        )}

        {registrations.map((r) => (
          <RegistrationRow key={r.id} registration={r} eventId={id} />
        ))}
      </div>

      {registrations.length > 0 && (
        <Badge variant="outline" className="text-xs">
          Showing {registrations.length}{" "}
          {registrations.length === 1 ? "signup" : "signups"}
        </Badge>
      )}
    </div>
  )
}
