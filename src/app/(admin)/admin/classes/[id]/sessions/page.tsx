import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Plus, BarChart3, Calendar } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/server"
import { getClassSessions } from "@/lib/queries/attendance"
import { SessionRow } from "./session-row"
import { SessionForm } from "./session-form"

export const metadata: Metadata = {
  title: "Class sessions | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminClassSessionsPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: classData } = await supabase
    .from("classes")
    .select("id, title, type")
    .eq("id", id)
    .maybeSingle()
  if (!classData) notFound()

  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("class_id", id)
    .neq("status", "dropped")

  const { data: sessions, tableMissing } = await getClassSessions(id)

  // Per-session attended counts (one query, group in memory)
  const sessionIds = sessions.map((s) => s.id)
  let attendedBySession = new Map<string, number>()
  if (sessionIds.length > 0) {
    const { data: attendance } = await supabase
      .from("class_attendance")
      .select("session_id, status")
      .in("session_id", sessionIds)
      .in("status", ["present", "late"])
    for (const a of (attendance || []) as { session_id: string }[]) {
      attendedBySession.set(
        a.session_id,
        (attendedBySession.get(a.session_id) || 0) + 1
      )
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/classes/${id}/edit`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to class
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Calendar className="h-7 w-7" />
              Sessions
            </h1>
            <p className="text-muted-foreground">
              {classData.title} · {sessions.length}{" "}
              {sessions.length === 1 ? "session" : "sessions"} · {enrolledCount || 0} enrolled
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href={`/admin/classes/${id}/attendance`}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Attendance report
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
                supabase/migrations/014_class_attendance.sql
              </code>{" "}
              in the Supabase SQL editor first.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {sessions.length === 0 && !tableMissing ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No sessions scheduled yet. Add the first one below.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <SessionRow
              key={s.id}
              classId={id}
              session={s}
              attendedCount={attendedBySession.get(s.id) || 0}
              totalEnrolled={enrolledCount || 0}
            />
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new session
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SessionForm classId={id} />
        </CardContent>
      </Card>
    </div>
  )
}
