"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

const ROLES = ["user", "instructor", "admin", "super_admin"] as const
type Role = (typeof ROLES)[number]

export async function changeUserRoleAction(
  userId: string,
  role: string
): Promise<{ ok?: boolean; error?: string }> {
  if (!(ROLES as readonly string[]).includes(role)) {
    return { error: "Invalid role" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Look up the actor's role
  const { data: actor } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!actor || !["admin", "super_admin"].includes(actor.role)) {
    return { error: "Forbidden" }
  }

  // Prevent demoting yourself away from super_admin (lock-out protection)
  if (userId === user.id && actor.role === "super_admin" && role !== "super_admin") {
    return {
      error:
        "You can't demote yourself from super_admin. Promote another user first, then they can demote you.",
    }
  }

  // Only super_admin can grant super_admin
  if (role === "super_admin" && actor.role !== "super_admin") {
    return { error: "Only a super_admin can grant super_admin" }
  }

  // Look up the target user's current role
  const { data: target } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .maybeSingle()

  if (!target) return { error: "User not found" }

  // Only super_admin can change another super_admin's role
  if (target.role === "super_admin" && actor.role !== "super_admin") {
    return { error: "Only a super_admin can change another super_admin's role" }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)

  if (error) return { error: error.message }

  revalidatePath("/admin/users")
  return { ok: true }
}
