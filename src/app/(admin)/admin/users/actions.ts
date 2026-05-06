"use server"

import { createClient as createSsrClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"
import { sendTransactionalEmail } from "@/lib/email"
import { getSiteSettings } from "@/lib/queries/settings"

const ROLES = ["user", "instructor", "admin", "super_admin"] as const
type Role = (typeof ROLES)[number]

const createClient = createSsrClient

function getServiceClient() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}

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

  const { data: updated, error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select("id")

  if (error) return { error: error.message }
  if (!updated || updated.length === 0) {
    return {
      error:
        "Update was blocked by row-level security. Apply migration 015_admin_update_profiles.sql in Supabase.",
    }
  }

  revalidatePath("/admin/users")
  return { ok: true }
}

export async function inviteUserAction(
  rawEmail: string,
  rawRole: string,
  rawFullName: string
): Promise<{ ok?: boolean; error?: string; warning?: string }> {
  const email = rawEmail.trim().toLowerCase()
  const role = rawRole.trim()
  const fullName = rawFullName.trim()

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Please enter a valid email address." }
  }
  if (!(ROLES as readonly string[]).includes(role)) {
    return { error: "Invalid role." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: actor } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (!actor || !["admin", "super_admin"].includes(actor.role)) {
    return { error: "Forbidden" }
  }
  if (role === "super_admin" && actor.role !== "super_admin") {
    return { error: "Only a super_admin can invite a super_admin." }
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return {
      error:
        "SUPABASE_SERVICE_ROLE_KEY is not set in this environment. Add it in Vercel → Settings → Environment Variables.",
    }
  }

  const admin = getServiceClient()

  // Create the auth user (pre-confirmed so no Supabase confirmation email fires).
  const { data: created, error: createErr } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: fullName ? { full_name: fullName } : undefined,
  })

  if (createErr || !created?.user) {
    const msg = createErr?.message || "Failed to create user."
    if (/already.*registered|already exists|duplicate/i.test(msg)) {
      return { error: "A user with that email already exists." }
    }
    return { error: msg }
  }

  // Set the invited role + name on the profile (handle_new_user trigger creates the row).
  const profileUpdate: Record<string, string> = { role }
  if (fullName) profileUpdate.full_name = fullName
  const { error: profileErr } = await admin
    .from("profiles")
    .update(profileUpdate)
    .eq("id", created.user.id)
  if (profileErr) {
    return { error: `User created, but role/name not set: ${profileErr.message}` }
  }

  // Generate a recovery link they can use to set their password.
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
  const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
    type: "recovery",
    email,
    options: appUrl ? { redirectTo: `${appUrl}/dashboard` } : undefined,
  })
  if (linkErr || !linkData?.properties?.action_link) {
    return {
      error: `User created but invite link could not be generated: ${linkErr?.message || "unknown"}`,
    }
  }
  const inviteLink = linkData.properties.action_link

  // Send branded invite email via our SMTP (not Supabase's default mailer).
  const settings = await getSiteSettings()
  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const greeting = fullName ? `Hi ${fullName},` : "Hello,"
  const roleLabel =
    role === "super_admin"
      ? "Super Admin"
      : role.charAt(0).toUpperCase() + role.slice(1)

  try {
    await sendTransactionalEmail({
      to: email,
      subject: `You've been invited to ${siteName}`,
      text:
        `${greeting}\n\n` +
        `An admin at ${siteName} has invited you to join as a ${roleLabel}.\n\n` +
        `Click the link below to set your password and sign in:\n\n` +
        `${inviteLink}\n\n` +
        `This link expires in 1 hour. If it expires, ask the admin to resend the invite.\n\n` +
        `— ${siteName}\n` +
        (settings.primary_phone ? `Crisis line: ${settings.primary_phone}\n` : ""),
    })
  } catch (e) {
    revalidatePath("/admin/users")
    return {
      ok: true,
      warning: `User account was created, but the invite email failed to send (${
        e instanceof Error ? e.message : "unknown error"
      }). You can resend it later or share the link manually.`,
    }
  }

  revalidatePath("/admin/users")
  return { ok: true }
}
