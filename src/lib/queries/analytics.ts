import { createClient } from "@/lib/supabase/server"

export interface AnalyticsSnapshot {
  users: {
    total: number
    last30: number
    byRole: { role: string; count: number }[]
  }
  classes: {
    total: number
    published: number
    enrollments: number
    enrollmentsLast30: number
    topByEnrollment: { id: string; title: string; count: number }[]
  }
  donations: {
    count: number
    total: number
    last30Total: number
  }
  support: {
    new: number
    inProgress: number
    resolved: number
  }
  content: {
    publishedPosts: number
    publishedFaqs: number
    activeHeroSlides: number
    visibleEcmProviders: number
    publishedServices: number
  }
  subscribers: {
    active: number
    last30: number
  }
  recentActivity: {
    type: string
    label: string
    when: string
  }[]
}

function emptySnapshot(): AnalyticsSnapshot {
  return {
    users: { total: 0, last30: 0, byRole: [] },
    classes: { total: 0, published: 0, enrollments: 0, enrollmentsLast30: 0, topByEnrollment: [] },
    donations: { count: 0, total: 0, last30Total: 0 },
    support: { new: 0, inProgress: 0, resolved: 0 },
    content: {
      publishedPosts: 0,
      publishedFaqs: 0,
      activeHeroSlides: 0,
      visibleEcmProviders: 0,
      publishedServices: 0,
    },
    subscribers: { active: 0, last30: 0 },
    recentActivity: [],
  }
}

const DAY_MS = 24 * 60 * 60 * 1000
const since30dIso = () => new Date(Date.now() - 30 * DAY_MS).toISOString()

async function safeCount(
  supabase: Awaited<ReturnType<typeof createClient>>,
  table: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  filter?: (q: any) => any
): Promise<number> {
  try {
    const base = supabase.from(table).select("*", { count: "exact", head: true })
    const q = filter ? filter(base) : base
    const { count } = await q
    return count || 0
  } catch {
    return 0
  }
}

export async function getAnalyticsSnapshot(): Promise<AnalyticsSnapshot> {
  try {
    const supabase = await createClient()
    const cutoff = since30dIso()
    const snapshot = emptySnapshot()

    // ---- Users ----
    snapshot.users.total = await safeCount(supabase, "profiles")
    snapshot.users.last30 = await safeCount(supabase, "profiles", (q) =>
      q.gte("created_at", cutoff)
    )
    try {
      const { data } = await supabase.from("profiles").select("role")
      const counts = new Map<string, number>()
      for (const row of data || []) {
        const role = (row as { role?: string }).role || "user"
        counts.set(role, (counts.get(role) || 0) + 1)
      }
      snapshot.users.byRole = Array.from(counts.entries())
        .map(([role, count]) => ({ role, count }))
        .sort((a, b) => b.count - a.count)
    } catch {
      // leave empty
    }

    // ---- Classes ----
    snapshot.classes.total = await safeCount(supabase, "classes")
    snapshot.classes.published = await safeCount(supabase, "classes", (q) =>
      q.eq("is_published", true)
    )
    snapshot.classes.enrollments = await safeCount(supabase, "enrollments")
    snapshot.classes.enrollmentsLast30 = await safeCount(supabase, "enrollments", (q) =>
      q.gte("enrolled_at", cutoff)
    )
    try {
      const { data } = await supabase
        .from("enrollments")
        .select("class_id, classes(title)")
        .limit(2000)
      const counts = new Map<string, { title: string; count: number }>()
      for (const row of (data || []) as { class_id: string; classes?: { title?: string } | null }[]) {
        const title = row.classes?.title || "Untitled class"
        const existing = counts.get(row.class_id)
        if (existing) existing.count += 1
        else counts.set(row.class_id, { title, count: 1 })
      }
      snapshot.classes.topByEnrollment = Array.from(counts.entries())
        .map(([id, v]) => ({ id, title: v.title, count: v.count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    } catch {
      // leave empty
    }

    // ---- Donations ----
    snapshot.donations.count = await safeCount(supabase, "donations")
    try {
      const { data } = await supabase.from("donations").select("amount, created_at")
      let total = 0
      let last30Total = 0
      for (const row of (data || []) as { amount: number; created_at: string }[]) {
        total += row.amount || 0
        if (row.created_at >= cutoff) last30Total += row.amount || 0
      }
      snapshot.donations.total = total
      snapshot.donations.last30Total = last30Total
    } catch {
      // leave totals at zero
    }

    // ---- Support ----
    snapshot.support.new = await safeCount(supabase, "support_requests", (q) =>
      q.eq("status", "new")
    )
    snapshot.support.inProgress = await safeCount(supabase, "support_requests", (q) =>
      q.eq("status", "in_progress")
    )
    snapshot.support.resolved = await safeCount(supabase, "support_requests", (q) =>
      q.eq("status", "resolved")
    )

    // ---- Content ----
    snapshot.content.publishedPosts = await safeCount(supabase, "blog_posts", (q) =>
      q.eq("is_published", true)
    )
    snapshot.content.publishedFaqs = await safeCount(supabase, "faqs", (q) =>
      q.eq("is_published", true)
    )
    snapshot.content.activeHeroSlides = await safeCount(supabase, "hero_slides", (q) =>
      q.eq("is_active", true)
    )
    snapshot.content.visibleEcmProviders = await safeCount(supabase, "ecm_providers", (q) =>
      q.eq("is_visible", true)
    )
    snapshot.content.publishedServices = await safeCount(supabase, "services", (q) =>
      q.eq("is_published", true)
    )

    // ---- Subscribers ----
    snapshot.subscribers.active = await safeCount(supabase, "subscribers", (q) =>
      q.eq("is_active", true)
    )
    snapshot.subscribers.last30 = await safeCount(supabase, "subscribers", (q) =>
      q.gte("created_at", cutoff)
    )

    // ---- Recent activity (best-effort) ----
    try {
      const [recentReqs, recentEnrolls, recentDonations] = await Promise.all([
        supabase
          .from("support_requests")
          .select("name, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
        supabase
          .from("enrollments")
          .select("enrolled_at, classes(title)")
          .order("enrolled_at", { ascending: false })
          .limit(3),
        supabase
          .from("donations")
          .select("donor_name, amount, created_at")
          .order("created_at", { ascending: false })
          .limit(3),
      ])
      const activity: AnalyticsSnapshot["recentActivity"] = []
      for (const r of (recentReqs.data || []) as { name: string; created_at: string }[]) {
        activity.push({
          type: "support",
          label: `New message from ${r.name}`,
          when: r.created_at,
        })
      }
      for (const e of (recentEnrolls.data || []) as {
        enrolled_at: string
        classes?: { title?: string } | null
      }[]) {
        activity.push({
          type: "enrollment",
          label: `Enrollment: ${e.classes?.title || "a class"}`,
          when: e.enrolled_at,
        })
      }
      for (const d of (recentDonations.data || []) as {
        donor_name: string
        amount: number
        created_at: string
      }[]) {
        activity.push({
          type: "donation",
          label: `${d.donor_name || "Anonymous"} donated $${(d.amount || 0).toFixed(2)}`,
          when: d.created_at,
        })
      }
      snapshot.recentActivity = activity
        .sort((a, b) => (a.when < b.when ? 1 : -1))
        .slice(0, 8)
    } catch {
      // leave empty
    }

    return snapshot
  } catch {
    return emptySnapshot()
  }
}
