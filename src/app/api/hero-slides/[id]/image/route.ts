import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { streamAsAttachment } from "@/lib/media-download"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: slide } = await supabase
    .from("hero_slides")
    .select("title, background_image_url, is_active, allow_download")
    .eq("id", id)
    .maybeSingle()

  if (!slide || !slide.is_active || !slide.background_image_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  // Downloading is opt-in per slide.
  if (!slide.allow_download) {
    return NextResponse.json({ error: "Not available" }, { status: 403 })
  }

  return streamAsAttachment(slide.background_image_url, slide.title)
}
