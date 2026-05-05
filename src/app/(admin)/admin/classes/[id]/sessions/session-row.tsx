"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, Pencil, Trash2, ListChecks } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { ClassSession } from "@/types/attendance"
import { SessionForm } from "./session-form"
import { deleteSessionAction } from "./actions"

interface SessionRowProps {
  classId: string
  session: ClassSession
  attendedCount: number
  totalEnrolled: number
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function SessionRow({
  classId,
  session,
  attendedCount,
  totalEnrolled,
}: SessionRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const isPast = new Date(session.session_date).getTime() < Date.now()
  const rate =
    totalEnrolled > 0 ? Math.round((attendedCount / totalEnrolled) * 100) : 0

  const handleDelete = () => {
    if (
      !confirm(
        `Delete this session? Any attendance records will be deleted too.`
      )
    )
      return
    startTransition(async () => {
      await deleteSessionAction(classId, session.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Calendar className="h-4 w-4 text-teal-700 flex-shrink-0" />
              <span className="font-semibold text-slate-900 truncate">
                {session.title || formatDateTime(session.session_date)}
              </span>
              {isPast ? (
                <Badge variant="outline" className="text-xs">
                  Past
                </Badge>
              ) : (
                <Badge className="bg-teal-500 text-xs">Upcoming</Badge>
              )}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(session.session_date)}
              {session.location_override && (
                <> · {session.location_override}</>
              )}
            </div>
            {totalEnrolled > 0 && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="font-medium">
                  {attendedCount} / {totalEnrolled} attended
                </span>
                <Badge
                  variant="outline"
                  className={
                    rate >= 80
                      ? "text-emerald-700 border-emerald-200"
                      : rate >= 50
                        ? "text-amber-700 border-amber-200"
                        : "text-rose-700 border-rose-200"
                  }
                >
                  {rate}%
                </Badge>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Button asChild size="sm" variant="default">
              <Link href={`/admin/classes/${classId}/sessions/${session.id}`}>
                <ListChecks className="h-3.5 w-3.5 mr-1" />
                Take attendance
              </Link>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditing(true)}
              disabled={pending}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDelete}
              disabled={pending}
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit session</DialogTitle>
          </DialogHeader>
          <SessionForm
            classId={classId}
            session={session}
            onDone={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
