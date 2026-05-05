"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { AttendanceStatus } from "@/types/attendance"

const STATUSES: AttendanceStatus[] = ["present", "absent", "late", "excused"]

interface SessionInput {
  session_date: string
  title: string
  location_override: string
  notes: string
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseSessionForm(formData: FormData): SessionInput | { error: string } {
  const dateRaw = (formData.get("session_date") || "").toString().trim()
  if (!dateRaw) return { error: "Session date is required" }
  const date = new Date(dateRaw)
  if (isNaN(date.getTime())) return { error: "Invalid date" }

  return {
    session_date: date.toISOString(),
    title: (formData.get("title") || "").toString().trim(),
    location_override: (formData.get("location_override") || "").toString().trim(),
    notes: (formData.get("notes") || "").toString().trim(),
  }
}

function toRow(input: SessionInput) {
  return {
    session_date: input.session_date,
    title: nullable(input.title),
    location_override: nullable(input.location_override),
    notes: nullable(input.notes),
  }
}

export async function createSessionAction(classId: string, formData: FormData) {
  const parsed = parseSessionForm(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("class_sessions")
    .insert({ ...toRow(parsed), class_id: classId })
    .select("id")
    .single()

  if (error) return { error: error.message }

  revalidatePath(`/admin/classes/${classId}/sessions`)
  revalidatePath(`/admin/classes/${classId}/attendance`)
  redirect(`/admin/classes/${classId}/sessions/${data.id}`)
}

export async function updateSessionAction(
  classId: string,
  sessionId: string,
  formData: FormData
) {
  const parsed = parseSessionForm(formData)
  if ("error" in parsed) return { error: parsed.error }

  const supabase = await createClient()
  const { error } = await supabase
    .from("class_sessions")
    .update(toRow(parsed))
    .eq("id", sessionId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/classes/${classId}/sessions`)
  revalidatePath(`/admin/classes/${classId}/sessions/${sessionId}`)
  revalidatePath(`/admin/classes/${classId}/attendance`)
  return { ok: true }
}

export async function deleteSessionAction(classId: string, sessionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("class_sessions")
    .delete()
    .eq("id", sessionId)

  if (error) return { error: error.message }

  revalidatePath(`/admin/classes/${classId}/sessions`)
  revalidatePath(`/admin/classes/${classId}/attendance`)
  return { ok: true }
}

interface AttendanceEntry {
  user_id: string
  status: AttendanceStatus
  notes?: string
}

export async function saveAttendanceAction(
  classId: string,
  sessionId: string,
  entries: AttendanceEntry[]
): Promise<{ ok?: boolean; error?: string; saved?: number }> {
  if (!Array.isArray(entries) || entries.length === 0) {
    return { error: "No attendance entries provided" }
  }
  for (const e of entries) {
    if (!STATUSES.includes(e.status)) {
      return { error: `Invalid status: ${e.status}` }
    }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const nowIso = new Date().toISOString()

  const rows = entries.map((e) => ({
    session_id: sessionId,
    user_id: e.user_id,
    status: e.status,
    notes: e.notes?.trim() || null,
    marked_by_admin_id: user.id,
    marked_at: nowIso,
  }))

  // Upsert by (session_id, user_id) — replaces existing rows in one shot
  const { error } = await supabase
    .from("class_attendance")
    .upsert(rows, { onConflict: "session_id,user_id" })

  if (error) return { error: error.message }

  revalidatePath(`/admin/classes/${classId}/sessions`)
  revalidatePath(`/admin/classes/${classId}/sessions/${sessionId}`)
  revalidatePath(`/admin/classes/${classId}/attendance`)
  return { ok: true, saved: rows.length }
}
