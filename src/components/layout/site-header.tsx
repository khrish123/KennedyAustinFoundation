import { createClient } from "@/lib/supabase/server"
import { getSiteSettings } from "@/lib/queries/settings"
import { Header, type HeaderUser } from "./header"

interface SiteHeaderProps {
  /** Optional override. If omitted, the user is fetched from the session. */
  user?: HeaderUser | null
}

/**
 * Async server wrapper around <Header /> that pulls the live site settings and
 * the signed-in user from the request. Use this on server pages so logged-in
 * visitors see their dropdown and admin updates show up without a redeploy.
 */
export async function SiteHeader({ user: passedUser }: SiteHeaderProps = {}) {
  const settings = await getSiteSettings()

  let user = passedUser
  if (user === undefined) {
    try {
      const supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("id", authUser.id)
          .maybeSingle()

        user = {
          id: authUser.id,
          email: authUser.email!,
          full_name: profile?.full_name ?? undefined,
          avatar_url: profile?.avatar_url ?? undefined,
          role: profile?.role ?? undefined,
        }
      } else {
        user = null
      }
    } catch {
      user = null
    }
  }

  return <Header user={user ?? null} settings={settings} />
}
