import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  Users,
  BookOpen,
  DollarSign,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Mail,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Admin Dashboard",
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get stats
  const { count: usersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  const { count: classesCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("is_published", true)

  const { count: donationsCount } = await supabase
    .from("donations")
    .select("*", { count: "exact", head: true })

  const { count: supportCount } = await supabase
    .from("support_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "new")

  const { count: subscribersCount } = await supabase
    .from("subscribers")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  // Get total donations amount
  const { data: donationsData } = await supabase
    .from("donations")
    .select("amount")

  const totalDonations = donationsData?.reduce((sum, d) => sum + (d.amount || 0), 0) || 0

  const stats = [
    {
      title: "Total Users",
      value: usersCount || 0,
      change: "+12%",
      trend: "up",
      icon: Users,
      href: "/admin/users",
    },
    {
      title: "Active Classes",
      value: classesCount || 0,
      change: "+3",
      trend: "up",
      icon: BookOpen,
      href: "/admin/classes",
    },
    {
      title: "Total Donations",
      value: `$${totalDonations.toLocaleString()}`,
      change: "+8%",
      trend: "up",
      icon: DollarSign,
      href: "/admin/donations",
    },
    {
      title: "New Requests",
      value: supportCount || 0,
      change: supportCount && supportCount > 0 ? "Action needed" : "All clear",
      trend: supportCount && supportCount > 0 ? "down" : "up",
      icon: MessageSquare,
      href: "/admin/support",
    },
  ]

  const quickActions = [
    {
      title: "Create New Class",
      description: "Add a new course or workshop",
      href: "/admin/classes/new",
    },
    {
      title: "Send Campaign",
      description: "Create email or push notification",
      href: "/admin/campaigns/new",
    },
    {
      title: "View Analytics",
      description: "Check platform performance",
      href: "/admin/analytics",
    },
    {
      title: "Manage Content",
      description: "Edit pages and resources",
      href: "/admin/content",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/campaigns/new">
              <Mail className="mr-2 h-4 w-4" />
              New Campaign
            </Link>
          </Button>
          <Button asChild>
            <Link href="/admin/classes/new">
              <BookOpen className="mr-2 h-4 w-4" />
              Add Class
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center text-xs mt-1">
                  {stat.trend === "up" ? (
                    <TrendingUp className="h-3 w-3 text-emerald-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-amber-500 mr-1" />
                  )}
                  <span className={stat.trend === "up" ? "text-emerald-500" : "text-amber-500"}>
                    {stat.change}
                  </span>
                  <span className="text-muted-foreground ml-1">from last month</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions & Subscribers */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                href={action.href}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
              >
                <div>
                  <div className="font-medium">{action.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {action.description}
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Subscribers Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Email Subscribers</CardTitle>
            <CardDescription>Newsletter and campaign reach</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-2">
              {subscribersCount || 0}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Active subscribers ready to receive your campaigns
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Email open rate</span>
                <span className="font-medium">42%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Click-through rate</span>
                <span className="font-medium">12%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Unsubscribe rate</span>
                <span className="font-medium">0.5%</span>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/admin/campaigns">
                Manage Campaigns
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              {
                action: "New user registration",
                details: "john.doe@example.com joined the platform",
                time: "5 minutes ago",
                type: "user",
              },
              {
                action: "Donation received",
                details: "$100 one-time donation",
                time: "1 hour ago",
                type: "donation",
              },
              {
                action: "Support request",
                details: "New inquiry about grief counseling",
                time: "2 hours ago",
                type: "support",
              },
              {
                action: "Class enrollment",
                details: "New enrollment in 'Healing Through Grief'",
                time: "3 hours ago",
                type: "class",
              },
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      activity.type === "donation"
                        ? "success"
                        : activity.type === "support"
                        ? "warning"
                        : "secondary"
                    }
                    className="w-20 justify-center"
                  >
                    {activity.type}
                  </Badge>
                  <div>
                    <div className="font-medium text-sm">{activity.action}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.details}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.time}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
