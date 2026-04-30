import { Metadata } from "next"
import { BarChart3, Users, BookOpen, DollarSign, Construction } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Analytics | Admin",
}

const previewMetrics = [
  { label: "Active Members", icon: Users },
  { label: "Class Completions", icon: BookOpen },
  { label: "Donations", icon: DollarSign },
  { label: "Engagement", icon: BarChart3 },
]

export default function AdminAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Site-wide engagement, enrollment, and donation metrics.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {previewMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">—</div>
              <p className="text-xs text-muted-foreground">Data will appear once analytics are wired up.</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Construction className="h-5 w-5" />
          </div>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            Charts and reports for membership growth, class enrollment, lesson completion rates,
            donation trends, and campaign performance will live here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  )
}
