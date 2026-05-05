import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, FileText } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getSessionById, getSessionRoster } from "@/lib/queries/attendance"
import { AttendanceRoster } from "./attendance-roster"

export const metadata: Metadata = {
  title: "Take attendance | Admin",
}

interface PageProps {
  params: Promise<{ id: string; sessionId: string }>
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function TakeAttendancePage({ params }: PageProps) {
  const { id, sessionId } = await params

  const supabase = await createClient()
  const [{ data: classData }, session] = await Promise.all([
    supabase.from("classes").select("id, title").eq("id", id).maybeSingle(),
    getSessionById(sessionId),
  ])

  if (!classData || !session) notFound()
  if (session.class_id !== id) notFound()

  const roster = await getSessionRoster(id, sessionId)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/classes/${id}/sessions`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All sessions
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">
          {session.title || classData.title}
        </h1>
        <p className="text-muted-foreground">{classData.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Session details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-700" />
            {formatDateTime(session.session_date)}
          </div>
          {session.location_override && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-teal-700" />
              {session.location_override}
            </div>
          )}
          {session.notes && (
            <div className="flex items-start gap-2">
              <FileText className="h-4 w-4 text-teal-700 mt-0.5 flex-shrink-0" />
              <span className="whitespace-pre-line">{session.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      <AttendanceRoster
        classId={id}
        sessionId={sessionId}
        initialRoster={roster}
      />
    </div>
  )
}
