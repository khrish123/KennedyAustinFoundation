import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getClassAttendanceReport } from "@/lib/queries/attendance"

/**
 * Returns the per-class attendance report as a CSV download.
 * Admin-only — verifies the caller has admin or super_admin role.
 */
export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (!profile || !["admin", "super_admin"].includes(profile.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: classData } = await supabase
    .from("classes")
    .select("title, slug")
    .eq("id", id)
    .maybeSingle()
  if (!classData) {
    return NextResponse.json({ error: "Class not found" }, { status: 404 })
  }

  const report = await getClassAttendanceReport(id)

  // Header row + per-member row + per-session columns
  const sessionDateHeaders = report.bySession.map((s) =>
    new Date(s.session.session_date).toISOString().slice(0, 10)
  )

  const escape = (v: string | number | null | undefined) => {
    if (v === null || v === undefined) return ""
    const str = String(v)
    if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`
    return str
  }

  const lines: string[] = []
  lines.push(
    [
      "member_name",
      "user_id",
      "total_sessions",
      "attended",
      "present",
      "late",
      "excused",
      "absent",
      "attendance_rate_pct",
      ...sessionDateHeaders,
    ]
      .map(escape)
      .join(",")
  )

  // Build per-(member, session) status map
  const supabaseInner = await createClient()
  const { data: attendanceRaw } = await supabaseInner
    .from("class_attendance")
    .select("user_id, session_id, status, class_sessions!inner(class_id)")
    .eq("class_sessions.class_id", id)

  const attendanceMap = new Map<string, string>() // `${user_id}:${session_id}` -> status
  for (const a of (attendanceRaw || []) as {
    user_id: string
    session_id: string
    status: string
  }[]) {
    attendanceMap.set(`${a.user_id}:${a.session_id}`, a.status)
  }

  for (const m of report.allMembers) {
    const sessionStatuses = report.bySession.map(
      (s) => attendanceMap.get(`${m.user_id}:${s.session.id}`) || "absent"
    )
    lines.push(
      [
        m.full_name || "",
        m.user_id,
        m.totalSessions,
        m.attended,
        m.presentCount,
        m.lateCount,
        m.excusedCount,
        m.absentCount,
        m.attendanceRate,
        ...sessionStatuses,
      ]
        .map(escape)
        .join(",")
    )
  }

  const csv = lines.join("\n")
  const safeSlug = (classData.slug || "class").replace(/[^a-z0-9-]/gi, "-")
  const today = new Date().toISOString().slice(0, 10)
  const filename = `${safeSlug}-attendance-${today}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  })
}
