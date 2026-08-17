import { NextResponse } from "next/server"
import { getEventById } from "@/lib/queries/events"

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
}

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "event"
  )
}

/**
 * Streams an event's cover image back with an attachment header so the browser
 * saves it. The images live on Supabase storage (a different origin), where a
 * plain <a download> would be ignored.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const event = await getEventById(id)
  if (!event || !event.is_published || !event.image_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  let upstream: Response
  try {
    upstream = await fetch(event.image_url)
  } catch {
    return NextResponse.json({ error: "Image unavailable" }, { status: 502 })
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Image unavailable" }, { status: 502 })
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream"
  const urlExt = event.image_url.split("?")[0].split(".").pop()?.toLowerCase()
  const ext =
    EXT_BY_TYPE[contentType] ||
    (urlExt && /^[a-z0-9]{2,4}$/.test(urlExt) ? urlExt : "jpg")

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${slugify(event.title)}.${ext}"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
