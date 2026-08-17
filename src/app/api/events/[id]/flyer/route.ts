import { NextResponse } from "next/server"
import { getEventById } from "@/lib/queries/events"
import { streamAsAttachment } from "@/lib/media-download"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const event = await getEventById(id)
  if (!event || !event.is_published || !event.image_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }
  // Admins can switch the download off per event.
  if (event.allow_flyer_download === false) {
    return NextResponse.json({ error: "Not available" }, { status: 403 })
  }

  return streamAsAttachment(event.image_url, event.title)
}
