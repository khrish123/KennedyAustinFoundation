import { getSiteSettings } from "@/lib/queries/settings"
import { Footer } from "./footer"

/**
 * Async server wrapper around <Footer /> that pulls live site settings.
 * Use this on server pages so admin updates show up immediately.
 */
export async function SiteFooter() {
  const settings = await getSiteSettings()
  return <Footer settings={settings} />
}
