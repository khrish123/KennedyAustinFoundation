"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Save, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABELS,
  type AttendanceRow,
  type AttendanceStatus,
} from "@/types/attendance"
import { saveAttendanceAction } from "../actions"

interface AttendanceRosterProps {
  classId: string
  sessionId: string
  initialRoster: AttendanceRow[]
}

export function AttendanceRoster({
  classId,
  sessionId,
  initialRoster,
}: AttendanceRosterProps) {
  const router = useRouter()
  const [roster, setRoster] = useState<AttendanceRow[]>(initialRoster)
  const [pending, startTransition] = useTransition()
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const setStatus = (userId: string, status: AttendanceStatus) => {
    setRoster((rows) =>
      rows.map((r) => (r.user_id === userId ? { ...r, status } : r))
    )
  }

  const setNotes = (userId: string, notes: string) => {
    setRoster((rows) =>
      rows.map((r) => (r.user_id === userId ? { ...r, notes } : r))
    )
  }

  const markAllPresent = () => {
    setRoster((rows) => rows.map((r) => ({ ...r, status: "present" })))
  }

  const handleSave = () => {
    setError(null)
    setSavedAt(null)
    startTransition(async () => {
      const result = await saveAttendanceAction(
        classId,
        sessionId,
        roster.map((r) => ({
          user_id: r.user_id,
          status: r.status,
          notes: r.notes || undefined,
        }))
      )
      if (result.error) {
        setError(result.error)
        return
      }
      setSavedAt(new Date().toLocaleTimeString("en-US"))
      router.refresh()
    })
  }

  if (roster.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-10 text-center">
          <Users className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No one is enrolled in this class yet, so there&apos;s no roster to mark.
          </p>
        </CardContent>
      </Card>
    )
  }

  const counts = {
    present: roster.filter((r) => r.status === "present").length,
    absent: roster.filter((r) => r.status === "absent").length,
    late: roster.filter((r) => r.status === "late").length,
    excused: roster.filter((r) => r.status === "excused").length,
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <CardTitle className="text-base">
              Roster · {roster.length} enrolled
            </CardTitle>
            <CardDescription>
              Tap a status for each member. Notes are optional and only visible
              to admins.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className="bg-emerald-500 text-xs">
              {counts.present} present
            </Badge>
            {counts.late > 0 && (
              <Badge className="bg-amber-500 text-xs">{counts.late} late</Badge>
            )}
            {counts.excused > 0 && (
              <Badge variant="outline" className="text-xs">
                {counts.excused} excused
              </Badge>
            )}
            {counts.absent > 0 && (
              <Badge className="bg-rose-500 text-xs">
                {counts.absent} absent
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={markAllPresent}
            disabled={pending}
          >
            Mark all present
          </Button>
          {savedAt && (
            <span className="text-xs text-emerald-700">Saved at {savedAt}</span>
          )}
        </div>

        <div className="space-y-2">
          {roster.map((row) => (
            <div
              key={row.user_id}
              className="rounded-lg border bg-background p-3 space-y-2"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {row.full_name || "Unnamed member"}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {row.user_id.slice(0, 8)}…
                  </p>
                </div>
                <div className="flex flex-wrap gap-1">
                  {ATTENDANCE_STATUSES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatus(row.user_id, s)}
                      className={
                        row.status === s
                          ? `rounded-md px-2 py-1 text-xs font-medium border ${ATTENDANCE_STATUS_COLORS[s]}`
                          : "rounded-md px-2 py-1 text-xs font-medium border bg-white text-slate-600 hover:bg-slate-50"
                      }
                    >
                      {ATTENDANCE_STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="text"
                value={row.notes || ""}
                onChange={(e) => setNotes(row.user_id, e.target.value)}
                placeholder="Optional note (admin-only)"
                className="w-full rounded-md border bg-background px-2 py-1 text-xs"
              />
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="sticky bottom-4 flex justify-end pt-2">
          <Button type="button" onClick={handleSave} disabled={pending} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {pending ? "Saving…" : "Save attendance"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
