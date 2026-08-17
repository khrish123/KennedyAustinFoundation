import { NextResponse } from "next/server"

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
}

export function slugify(s: string, fallback = "download") {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || fallback
  )
}

/**
 * Streams a remote image back with an attachment header so the browser saves
 * it. The files live on Supabase storage (a different origin), where a plain
 * <a download> is ignored.
 */
export async function streamAsAttachment(
  sourceUrl: string,
  baseName: string
): Promise<NextResponse> {
  let upstream: Response
  try {
    upstream = await fetch(sourceUrl)
  } catch {
    return NextResponse.json({ error: "Image unavailable" }, { status: 502 })
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Image unavailable" }, { status: 502 })
  }

  const contentType =
    upstream.headers.get("content-type") || "application/octet-stream"
  const urlExt = sourceUrl.split("?")[0].split(".").pop()?.toLowerCase()
  const ext =
    EXT_BY_TYPE[contentType] ||
    (urlExt && /^[a-z0-9]{2,4}$/.test(urlExt) ? urlExt : "jpg")

  return new NextResponse(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${slugify(baseName)}.${ext}"`,
      "Cache-Control": "public, max-age=3600",
    },
  })
}
