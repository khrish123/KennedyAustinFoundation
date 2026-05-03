import { Metadata } from "next"
import {
  BarChart3,
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  Mail,
  TrendingUp,
  Activity,
  Heart,
} from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getAnalyticsSnapshot } from "@/lib/queries/analytics"

export const metadata: Metadata = {
  title: "Analytics | Admin",
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

function timeAgo(iso: string) {
  const d = new Date(iso)
  const diffMs = Date.now() - d.getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
}

function activityIcon(type: string) {
  switch (type) {
    case "support":
      return MessageSquare
    case "enrollment":
      return BookOpen
    case "donation":
      return DollarSign
    default:
      return Activity
  }
}

export default async function AdminAnalyticsPage() {
  const s = await getAnalyticsSnapshot()

  const headlineCards = [
    {
      label: "Total Users",
      value: s.users.total.toLocaleString(),
      hint: `+${s.users.last30} in last 30 days`,
      icon: Users,
    },
    {
      label: "Class Enrollments",
      value: s.classes.enrollments.toLocaleString(),
      hint: `+${s.classes.enrollmentsLast30} in last 30 days`,
      icon: BookOpen,
    },
    {
      label: "Donations Total",
      value: formatCurrency(s.donations.total),
      hint: `${formatCurrency(s.donations.last30Total)} in last 30 days`,
      icon: DollarSign,
    },
    {
      label: "Newsletter Subscribers",
      value: s.subscribers.active.toLocaleString(),
      hint: `+${s.subscribers.last30} in last 30 days`,
      icon: Mail,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Site-wide snapshot pulled live from your database.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {headlineCards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="text-xs text-muted-foreground inline-flex items-center gap-1 mt-1">
                <TrendingUp className="h-3 w-3" />
                {c.hint}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Users by role</CardTitle>
            <CardDescription>
              Breakdown of registered profiles by their assigned role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {s.users.byRole.length === 0 ? (
              <p className="text-sm text-muted-foreground">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {s.users.byRole.map((row) => {
                  const pct =
                    s.users.total > 0
                      ? Math.round((row.count / s.users.total) * 100)
                      : 0
                  return (
                    <div key={row.role} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium capitalize">
                          {row.role.replace(/_/g, " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {row.count} · {pct}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-teal-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top classes by enrollment</CardTitle>
            <CardDescription>
              {s.classes.published} published of {s.classes.total} total classes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {s.classes.topByEnrollment.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No enrollments yet. Once members enroll, the most popular
                classes appear here.
              </p>
            ) : (
              <div className="space-y-2">
                {s.classes.topByEnrollment.map((c, i) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 text-sm"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted-foreground w-4 text-right">
                        {i + 1}.
                      </span>
                      <span className="truncate">{c.title}</span>
                    </div>
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {c.count} enrolled
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Support queue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {s.support.new}
                </div>
                <p className="text-xs text-muted-foreground">New</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {s.support.inProgress}
                </div>
                <p className="text-xs text-muted-foreground">In progress</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">
                  {s.support.resolved}
                </div>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Content live
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Hero slides</span>
                <span className="font-semibold">{s.content.activeHeroSlides}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Services</span>
                <span className="font-semibold">{s.content.publishedServices}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Blog posts</span>
                <span className="font-semibold">{s.content.publishedPosts}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">FAQs</span>
                <span className="font-semibold">{s.content.publishedFaqs}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">ECM providers</span>
                <span className="font-semibold">{s.content.visibleEcmProviders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Donations count</span>
                <span className="font-semibold">{s.donations.count}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Recent activity
          </CardTitle>
          <CardDescription>
            Latest support messages, enrollments, and donations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {s.recentActivity.length === 0 ? (
            <div className="py-6 text-center">
              <Heart className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No activity yet — once members start engaging, you&apos;ll see it here.
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {s.recentActivity.map((a, i) => {
                const Icon = activityIcon(a.type)
                return (
                  <li key={i} className="flex items-center gap-3 py-2 text-sm">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-muted">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <span className="flex-1">{a.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(a.when)}
                    </span>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Numbers refresh on each page load — no hidden tracking.
      </p>
    </div>
  )
}
