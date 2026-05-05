export type AttendanceStatus = "present" | "absent" | "late" | "excused"

export const ATTENDANCE_STATUSES: AttendanceStatus[] = [
  "present",
  "absent",
  "late",
  "excused",
]

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: "Present",
  absent: "Absent",
  late: "Late",
  excused: "Excused",
}

export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  present: "bg-emerald-100 text-emerald-800 border-emerald-200",
  absent: "bg-rose-100 text-rose-800 border-rose-200",
  late: "bg-amber-100 text-amber-800 border-amber-200",
  excused: "bg-slate-100 text-slate-700 border-slate-200",
}

export interface ClassSession {
  id: string
  class_id: string
  session_date: string
  title: string | null
  location_override: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface ClassAttendance {
  id: string
  session_id: string
  user_id: string
  status: AttendanceStatus
  notes: string | null
  marked_by_admin_id: string | null
  marked_at: string | null
  created_at: string
  updated_at: string
}

export interface AttendanceRow {
  user_id: string
  full_name: string | null
  email: string | null
  status: AttendanceStatus
  notes: string | null
  attendance_id: string | null
}

export interface MemberAttendanceSummary {
  user_id: string
  full_name: string | null
  email: string | null
  totalSessions: number
  attended: number // present + late
  presentCount: number
  lateCount: number
  excusedCount: number
  absentCount: number
  attendanceRate: number // 0-100, present+late as % of totalSessions
}

export interface SessionAttendanceSummary {
  session: ClassSession
  totalEnrolled: number
  presentCount: number
  lateCount: number
  excusedCount: number
  absentCount: number
}

export interface ClassAttendanceReport {
  totalSessions: number
  totalEnrolled: number
  averageAttendanceRate: number
  membersByEngagement: {
    high: MemberAttendanceSummary[] // ≥80%
    mid: MemberAttendanceSummary[] // 50–79%
    low: MemberAttendanceSummary[] // <50%
  }
  bySession: SessionAttendanceSummary[]
  allMembers: MemberAttendanceSummary[]
}
