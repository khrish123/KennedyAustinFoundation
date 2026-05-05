import { createClient } from "@/lib/supabase/server"
import type {
  ClassSession,
  ClassAttendance,
  AttendanceRow,
  AttendanceStatus,
  ClassAttendanceReport,
  MemberAttendanceSummary,
  SessionAttendanceSummary,
} from "@/types/attendance"

interface QueryResult<T> {
  data: T
  tableMissing: boolean
  error?: string
}

function isMissing(message: string | undefined) {
  return !!message && /relation .* does not exist/i.test(message)
}

export async function getClassSessions(classId: string): Promise<
  QueryResult<ClassSession[]>
> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("class_sessions")
      .select("*")
      .eq("class_id", classId)
      .order("session_date", { ascending: false })

    if (error) {
      return {
        data: [],
        tableMissing: isMissing(error.message),
        error: error.message,
      }
    }
    return { data: (data || []) as ClassSession[], tableMissing: false }
  } catch (e) {
    return {
      data: [],
      tableMissing: false,
      error: e instanceof Error ? e.message : "Unknown error",
    }
  }
}

export async function getSessionById(
  sessionId: string
): Promise<ClassSession | null> {
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("class_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle()
    return (data as ClassSession) || null
  } catch {
    return null
  }
}

/**
 * Build the attendance roster for a single session: every enrolled member,
 * with their current attendance row (if any) merged in.
 */
export async function getSessionRoster(
  classId: string,
  sessionId: string
): Promise<AttendanceRow[]> {
  try {
    const supabase = await createClient()

    const [{ data: enrollments }, { data: attendance }] = await Promise.all([
      supabase
        .from("enrollments")
        .select(
          "user_id, profiles(full_name, avatar_url), status"
        )
        .eq("class_id", classId)
        .neq("status", "dropped"),
      supabase
        .from("class_attendance")
        .select("*")
        .eq("session_id", sessionId),
    ])

    const attendanceByUser = new Map<string, ClassAttendance>()
    for (const a of (attendance || []) as ClassAttendance[]) {
      attendanceByUser.set(a.user_id, a)
    }

    // Pull email from auth.users for each enrolled user, best-effort.
    // RLS on profiles allows public read of full_name; auth.users isn't
    // directly readable so we just show full_name.
    const rows: AttendanceRow[] = []
    for (const enr of (enrollments || []) as {
      user_id: string
      profiles?: { full_name?: string | null } | null
    }[]) {
      const att = attendanceByUser.get(enr.user_id)
      rows.push({
        user_id: enr.user_id,
        full_name: enr.profiles?.full_name || null,
        email: null,
        status: (att?.status as AttendanceStatus) || "absent",
        notes: att?.notes || null,
        attendance_id: att?.id || null,
      })
    }

    rows.sort((a, b) => {
      const an = (a.full_name || "").toLowerCase()
      const bn = (b.full_name || "").toLowerCase()
      return an.localeCompare(bn)
    })

    return rows
  } catch {
    return []
  }
}

/**
 * Roll up the full per-class attendance report from raw sessions + attendance.
 */
export async function getClassAttendanceReport(
  classId: string
): Promise<ClassAttendanceReport> {
  const empty: ClassAttendanceReport = {
    totalSessions: 0,
    totalEnrolled: 0,
    averageAttendanceRate: 0,
    membersByEngagement: { high: [], mid: [], low: [] },
    bySession: [],
    allMembers: [],
  }

  try {
    const supabase = await createClient()

    const [{ data: sessions }, { data: enrollments }, { data: attendance }] =
      await Promise.all([
        supabase
          .from("class_sessions")
          .select("*")
          .eq("class_id", classId)
          .order("session_date", { ascending: true }),
        supabase
          .from("enrollments")
          .select("user_id, profiles(full_name)")
          .eq("class_id", classId)
          .neq("status", "dropped"),
        supabase
          .from("class_attendance")
          .select("*, class_sessions!inner(class_id)")
          .eq("class_sessions.class_id", classId),
      ])

    if (!sessions || !enrollments) return empty

    const sessionList = sessions as ClassSession[]
    const allAttendance = (attendance || []) as ClassAttendance[]

    // Per-session rollups
    const bySession: SessionAttendanceSummary[] = sessionList.map((s) => {
      const sessAtt = allAttendance.filter((a) => a.session_id === s.id)
      return {
        session: s,
        totalEnrolled: enrollments.length,
        presentCount: sessAtt.filter((a) => a.status === "present").length,
        lateCount: sessAtt.filter((a) => a.status === "late").length,
        excusedCount: sessAtt.filter((a) => a.status === "excused").length,
        absentCount:
          enrollments.length -
          sessAtt.filter(
            (a) =>
              a.status === "present" ||
              a.status === "late" ||
              a.status === "excused"
          ).length,
      }
    })

    // Per-member rollups
    type EnrollmentRow = {
      user_id: string
      profiles?: { full_name?: string | null } | null
    }
    const memberRows = (enrollments as EnrollmentRow[]).map((enr) => {
      const userAtt = allAttendance.filter((a) => a.user_id === enr.user_id)
      const presentCount = userAtt.filter((a) => a.status === "present").length
      const lateCount = userAtt.filter((a) => a.status === "late").length
      const excusedCount = userAtt.filter((a) => a.status === "excused").length
      const attended = presentCount + lateCount
      const totalSessions = sessionList.length
      const attendanceRate =
        totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0

      const summary: MemberAttendanceSummary = {
        user_id: enr.user_id,
        full_name: enr.profiles?.full_name || null,
        email: null,
        totalSessions,
        attended,
        presentCount,
        lateCount,
        excusedCount,
        absentCount: totalSessions - attended - excusedCount,
        attendanceRate,
      }
      return summary
    })

    memberRows.sort((a, b) => b.attendanceRate - a.attendanceRate)

    const high = memberRows.filter((m) => m.attendanceRate >= 80)
    const mid = memberRows.filter(
      (m) => m.attendanceRate >= 50 && m.attendanceRate < 80
    )
    const low = memberRows.filter((m) => m.attendanceRate < 50)

    const averageAttendanceRate =
      memberRows.length > 0
        ? Math.round(
            memberRows.reduce((sum, m) => sum + m.attendanceRate, 0) /
              memberRows.length
          )
        : 0

    return {
      totalSessions: sessionList.length,
      totalEnrolled: enrollments.length,
      averageAttendanceRate,
      membersByEngagement: { high, mid, low },
      bySession,
      allMembers: memberRows,
    }
  } catch {
    return empty
  }
}
