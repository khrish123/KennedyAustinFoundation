"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Mail,
  Phone,
  MapPin,
  Users as UsersIcon,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { EventRegistration } from "@/types/events"
import {
  setRegistrationStatusAction,
  deleteRegistrationAction,
} from "@/app/(admin)/admin/events/actions"

const STATUS_OPTIONS: { value: EventRegistration["status"]; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "confirmed", label: "Confirmed" },
  { value: "waitlist", label: "Waitlist" },
  { value: "canceled", label: "Canceled" },
]

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-blue-100 text-blue-800 border-blue-200",
  confirmed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  waitlist: "bg-purple-100 text-purple-800 border-purple-200",
  canceled: "bg-slate-100 text-slate-700 border-slate-200",
}

interface RegistrationRowProps {
  registration: EventRegistration
  eventId: string
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function RegistrationRow({ registration, eventId }: RegistrationRowProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState(registration.status)

  const onStatusChange = (next: string) => {
    setStatus(next as EventRegistration["status"])
    startTransition(async () => {
      const result = await setRegistrationStatusAction(
        registration.id,
        next,
        eventId
      )
      if (result?.error) {
        alert(result.error)
        setStatus(registration.status)
        return
      }
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete signup from ${registration.full_name}?`)) return
    startTransition(async () => {
      await deleteRegistrationAction(registration.id, eventId)
      router.refresh()
    })
  }

  const hasChildren = registration.children && registration.children.length > 0

  return (
    <div className="rounded-lg border bg-background p-4 space-y-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-slate-900 truncate">
              {registration.full_name}
            </h3>
            <Badge className={`${STATUS_COLORS[status]} text-xs border`}>
              {status}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {registration.registration_type}
            </Badge>
            {registration.guests_count > 1 && (
              <Badge variant="outline" className="text-xs">
                <UsersIcon className="h-3 w-3 mr-1" />
                {registration.guests_count} attending
              </Badge>
            )}
            {hasChildren && (
              <Badge variant="outline" className="text-xs">
                {registration.children.length}{" "}
                {registration.children.length === 1 ? "child" : "children"}
              </Badge>
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
            <a
              href={`mailto:${registration.email}`}
              className="inline-flex items-center gap-1 hover:text-teal-700"
            >
              <Mail className="h-3 w-3" />
              {registration.email}
            </a>
            {registration.phone && (
              <a
                href={`tel:${registration.phone.replace(/[^0-9+]/g, "")}`}
                className="inline-flex items-center gap-1 hover:text-teal-700"
              >
                <Phone className="h-3 w-3" />
                {registration.phone}
              </a>
            )}
            {registration.address && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {registration.address}
              </span>
            )}
            <span>Submitted {formatDateTime(registration.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Select value={status} onValueChange={onStatusChange} disabled={pending}>
            <SelectTrigger className="w-[140px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={pending}
            className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 h-8 w-8"
            title="Delete signup"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {(hasChildren || registration.notes) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1 text-xs text-teal-700 hover:underline"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" />
              Hide details
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" />
              Show details
            </>
          )}
        </button>
      )}

      {expanded && (
        <div className="space-y-3 pt-2 border-t">
          {hasChildren && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">
                Children
              </p>
              <ul className="space-y-1 text-sm">
                {registration.children.map((c, i) => (
                  <li
                    key={i}
                    className="rounded border bg-muted/30 px-2 py-1 text-slate-800"
                  >
                    <span className="font-medium">{c.name}</span> · age {c.age}
                    {c.gender && <> · {c.gender}</>}
                    {c.gift_idea && (
                      <span className="text-muted-foreground">
                        {" "}
                        — gift idea: {c.gift_idea}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {registration.notes && (
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">Notes</p>
              <p className="text-sm text-slate-700 whitespace-pre-line">
                {registration.notes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
