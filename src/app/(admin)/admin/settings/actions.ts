"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

type SettingsInput = {
  site_name: string
  site_tagline: string
  logo_url: string
  primary_phone: string
  crisis_line: string
  primary_email: string
  address: string
  founded_year: number | null
  founder_name: string
  footer_about: string
  newsletter_blurb: string
  facebook_url: string
  instagram_url: string
  twitter_url: string
  youtube_url: string
  copyright_text: string
}

function nullable(v: string) {
  const t = v.trim()
  return t === "" ? null : t
}

function parseFormData(formData: FormData): SettingsInput {
  const yearRaw = (formData.get("founded_year") || "").toString().trim()
  const year = yearRaw ? parseInt(yearRaw, 10) : NaN
  return {
    site_name: (formData.get("site_name") || "").toString().trim(),
    site_tagline: (formData.get("site_tagline") || "").toString().trim(),
    logo_url: (formData.get("logo_url") || "").toString().trim(),
    primary_phone: (formData.get("primary_phone") || "").toString().trim(),
    crisis_line: (formData.get("crisis_line") || "").toString().trim(),
    primary_email: (formData.get("primary_email") || "").toString().trim(),
    address: (formData.get("address") || "").toString().trim(),
    founded_year: Number.isFinite(year) ? year : null,
    founder_name: (formData.get("founder_name") || "").toString().trim(),
    footer_about: (formData.get("footer_about") || "").toString().trim(),
    newsletter_blurb: (formData.get("newsletter_blurb") || "").toString().trim(),
    facebook_url: (formData.get("facebook_url") || "").toString().trim(),
    instagram_url: (formData.get("instagram_url") || "").toString().trim(),
    twitter_url: (formData.get("twitter_url") || "").toString().trim(),
    youtube_url: (formData.get("youtube_url") || "").toString().trim(),
    copyright_text: (formData.get("copyright_text") || "").toString().trim(),
  }
}

function toRow(input: SettingsInput) {
  return {
    site_name: input.site_name || "Kennedy Austin Foundation",
    site_tagline: nullable(input.site_tagline),
    logo_url: nullable(input.logo_url),
    primary_phone: nullable(input.primary_phone),
    crisis_line: nullable(input.crisis_line),
    primary_email: nullable(input.primary_email),
    address: nullable(input.address),
    founded_year: input.founded_year,
    founder_name: nullable(input.founder_name),
    footer_about: nullable(input.footer_about),
    newsletter_blurb: nullable(input.newsletter_blurb),
    facebook_url: nullable(input.facebook_url),
    instagram_url: nullable(input.instagram_url),
    twitter_url: nullable(input.twitter_url),
    youtube_url: nullable(input.youtube_url),
    copyright_text: nullable(input.copyright_text),
  }
}

export async function saveSiteSettingsAction(
  existingId: string | null,
  formData: FormData
) {
  const input = parseFormData(formData)
  if (!input.site_name) return { error: "Site name is required" }

  const supabase = await createClient()
  const row = toRow(input)

  const { error } = existingId
    ? await supabase.from("site_settings").update(row).eq("id", existingId)
    : await supabase.from("site_settings").insert(row)

  if (error) return { error: error.message }

  // Revalidate every public page that consumes settings
  revalidatePath("/", "layout")
  return { ok: true }
}
