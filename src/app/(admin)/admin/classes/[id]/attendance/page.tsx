import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, Users, Download, BarChart3 } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/server"
import { getClassAttendanceReport } from "@/lib/queries/attendance"
import type { MemberAttendanceSummary } from "@/types/attendance"

export const metadata: Metadata = {
  title: "Attendance report | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function rateColor(rate: number) {
  if (rate >= 80) return "text-emerald-700 border-emerald-200 bg-emerald-50"
  if (rate >= 50) return "text-amber-700 border-amber-200 bg-amber-50"
  return "text-rose-700 border-rose-200 bg-rose-50"
}

function MemberList({
  title,
  description,
  members,
  emptyText,
}: {
  title: string
  description: string
  members: MemberAttendanceSummary[]
  emptyText: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center justify-between">
          <span>{title}</span>
          <Badge variant="outline">{members.length}</Badge>
        </CardTitle>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {members.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyText}</p>
        ) : (
          <ul className="divide-y">
            {members.map((m) => (
              <li
                key={m.user_id}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="font-medium truncate">
                  {m.full_name || "Unnamed member"}
                </span>
                <Badge variant="outline" className={`${rateColor(m.attendanceRate)} text-xs`}>
                  {m.attended}/{m.totalSessions} · {m.attendanceRate}%
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default async function AdminClassAttendancePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: classData } = await supabase
    .from("classes")
    .select("id, title")
    .eq("id", id)
    .maybeSingle()
  if (!classData) notFound()

  const report = await getClassAttendanceReport(id)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/classes/${id}/sessions`}
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Back to sessions
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <BarChart3 className="h-7 w-7" />
              Attendance Report
            </h1>
            <p className="text-muted-foreground">{classData.title}</p>
          </div>
          <Button asChild variant="outline">
            <a
              href={`/api/admin/classes/${id}/attendance.csv`}
              download
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </a>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions held</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalSessions}</div>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              all time
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{report.totalEnrolled}</div>
            <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${rateColor(report.averageAttendanceRate).split(" ")[0]}`}
            >
              {report.averageAttendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              across all members
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">High engagers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">
              {report.membersByEngagement.high.length}
            </div>
            <p className="text-xs text-muted-foreground">
              ≥80% attendance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <MemberList
          title="High engagement"
          description="Attended 80% or more of sessions"
          members={report.membersByEngagement.high}
          emptyText="No high-engagement members yet."
        />
        <MemberList
          title="Mid engagement"
          description="50–79% attendance"
          members={report.membersByEngagement.mid}
          emptyText="No mid-range members yet."
        />
        <MemberList
          title="Low engagement"
          description="Below 50% — may need outreach"
          members={report.membersByEngagement.low}
          emptyText="No low-engagement members."
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By session</CardTitle>
          <CardDescription>
            Attendance for each session in chronological order.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.bySession.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions held yet. Add some on the{" "}
              <Link
                href={`/admin/classes/${id}/sessions`}
                className="text-teal-700 underline"
              >
                Sessions page
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y">
              {report.bySession.map(({ session, presentCount, lateCount, excusedCount, absentCount, totalEnrolled }) => {
                const attended = presentCount + lateCount
                const rate =
                  totalEnrolled > 0
                    ? Math.round((attended / totalEnrolled) * 100)
                    : 0
                return (
                  <li
                    key={session.id}
                    className="flex items-center justify-between py-2 gap-3 text-sm flex-wrap"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/admin/classes/${id}/sessions/${session.id}`}
                        className="font-medium hover:underline"
                      >
                        {session.title || formatDate(session.session_date)}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(session.session_date)} · {presentCount} present
                        {lateCount > 0 && ` · ${lateCount} late`}
                        {excusedCount > 0 && ` · ${excusedCount} excused`}
                        {absentCount > 0 && ` · ${absentCount} absent`}
                      </div>
                    </div>
                    <Badge variant="outline" className={`${rateColor(rate)} text-xs`}>
                      {rate}%
                    </Badge>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">By member</CardTitle>
          <CardDescription>
            All enrolled members, sorted by attendance rate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.allMembers.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No one is enrolled in this class yet.
            </p>
          ) : (
            <ul className="divide-y">
              {report.allMembers.map((m) => (
                <li
                  key={m.user_id}
                  className="flex items-center justify-between py-2 text-sm gap-3 flex-wrap"
                >
                  <div className="min-w-0">
                    <span className="font-medium truncate">
                      {m.full_name || "Unnamed member"}
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {m.presentCount} present
                      {m.lateCount > 0 && ` · ${m.lateCount} late`}
                      {m.excusedCount > 0 && ` · ${m.excusedCount} excused`}
                      {m.absentCount > 0 && ` · ${m.absentCount} absent`}
                    </div>
                  </div>
                  <Badge variant="outline" className={`${rateColor(m.attendanceRate)} text-xs`}>
                    {m.attended}/{m.totalSessions} · {m.attendanceRate}%
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
