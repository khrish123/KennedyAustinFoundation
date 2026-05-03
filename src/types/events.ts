export type EventType =
  | "general"
  | "toy_drive"
  | "turkey_drive"
  | "workshop"
  | "fundraiser"
  | "dinner"
  | "support_group"
  | "volunteer_day"
  | "gathering"

export type RegistrationType = "none" | "rsvp" | "volunteer" | "toy_request"

export type RegistrationStatus =
  | "pending"
  | "approved"
  | "confirmed"
  | "waitlist"
  | "canceled"

export interface ChildEntry {
  name: string
  age: number
  gender?: string
  gift_idea?: string
}

export interface EventRecord {
  id: string
  title: string
  description: string | null
  date: string
  location: string | null
  image_url: string | null
  registration_required: boolean
  max_attendees: number | null
  event_type: EventType | string
  registration_type: RegistrationType
  registration_deadline: string | null
  is_published: boolean
  created_at: string
}

export interface EventRegistration {
  id: string
  event_id: string
  user_id: string | null
  registration_type: Exclude<RegistrationType, "none">
  full_name: string
  email: string
  phone: string | null
  address: string | null
  guests_count: number
  children: ChildEntry[]
  notes: string | null
  status: RegistrationStatus
  created_at: string
  updated_at: string
}

export const EVENT_TYPE_LABELS: Record<string, string> = {
  general: "General",
  toy_drive: "Toy Drive",
  turkey_drive: "Turkey Drive",
  workshop: "Workshop",
  fundraiser: "Fundraiser",
  dinner: "Dinner",
  support_group: "Support Group",
  volunteer_day: "Volunteer Day",
  gathering: "Community Gathering",
}

export const EVENT_TYPE_COLORS: Record<string, string> = {
  general: "bg-slate-100 text-slate-800 border-slate-200",
  toy_drive: "bg-rose-100 text-rose-800 border-rose-200",
  turkey_drive: "bg-amber-100 text-amber-800 border-amber-200",
  workshop: "bg-emerald-100 text-emerald-800 border-emerald-200",
  fundraiser: "bg-purple-100 text-purple-800 border-purple-200",
  dinner: "bg-orange-100 text-orange-800 border-orange-200",
  support_group: "bg-teal-100 text-teal-800 border-teal-200",
  volunteer_day: "bg-blue-100 text-blue-800 border-blue-200",
  gathering: "bg-pink-100 text-pink-800 border-pink-200",
}

export function eventTypeLabel(t: string | null | undefined): string {
  if (!t) return "Event"
  return EVENT_TYPE_LABELS[t] || t
}

export function eventTypeBadgeClass(t: string | null | undefined): string {
  if (!t) return EVENT_TYPE_COLORS.general
  return EVENT_TYPE_COLORS[t] || EVENT_TYPE_COLORS.general
}

export const REGISTRATION_TYPE_LABELS: Record<RegistrationType, string> = {
  none: "No registration",
  rsvp: "RSVP / attendance",
  volunteer: "Volunteer signup",
  toy_request: "Toy request (parents only)",
}
