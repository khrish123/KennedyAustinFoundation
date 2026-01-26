import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  BookOpen,
  PenTool,
  MessageCircle,
  TrendingUp,
  Calendar,
  Heart,
  ArrowRight,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Dashboard",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single()

  // Get daily inspiration
  const { data: inspiration } = await supabase
    .from("daily_inspirations")
    .select("*")
    .eq("is_active", true)
    .eq("language", profile?.language_preference || "en")
    .order("generated_at", { ascending: false })
    .limit(1)
    .single()

  // Get enrolled classes count
  const { count: enrolledCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)
    .eq("status", "enrolled")

  // Get recent journal entries count
  const { count: journalCount } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 18) return "Good afternoon"
    return "Good evening"
  }

  const quickActions = [
    {
      title: "Continue Learning",
      description: "Pick up where you left off",
      icon: BookOpen,
      href: "/my-classes",
      color: "text-blue-500",
    },
    {
      title: "Write in Journal",
      description: "Reflect on your day",
      icon: PenTool,
      href: "/journal",
      color: "text-purple-500",
    },
    {
      title: "Talk to AI Support",
      description: "Get guidance anytime",
      icon: MessageCircle,
      href: "/chat",
      color: "text-emerald-500",
    },
    {
      title: "View Progress",
      description: "See how far you've come",
      icon: TrendingUp,
      href: "/progress",
      color: "text-amber-500",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {greeting()}, {profile?.full_name?.split(" ")[0] || "Friend"}
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to your wellness journey
          </p>
        </div>
        <Button asChild>
          <Link href="/classes">
            Browse New Classes
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Daily Inspiration */}
      {inspiration && (
        <Card className="bg-gradient-to-r from-primary/10 to-purple-500/10 border-0">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-primary mb-1">Daily Inspiration</p>
                <p className="text-lg italic">&ldquo;{inspiration.content}&rdquo;</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Classes</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Journal Entries</CardTitle>
            <PenTool className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{journalCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              Total entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Your Streak</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 days</div>
            <p className="text-xs text-muted-foreground">
              Start your streak today!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardHeader className="pb-2">
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-base">{action.title}</CardTitle>
                  <CardDescription className="text-sm mt-1">
                    {action.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Learning Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Continue Learning</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/my-classes">
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {enrolledCount && enrolledCount > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {/* This would be populated with actual enrolled classes */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">In Progress</Badge>
                  <span className="text-xs text-muted-foreground">75% complete</span>
                </div>
                <h3 className="font-semibold">Healing Through Grief</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Continue where you left off
                </p>
                <Progress value={75} className="mt-3" />
                <Button asChild className="w-full mt-4">
                  <Link href="/my-classes">Continue</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No Classes Yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start your learning journey by enrolling in a class
              </p>
              <Button asChild>
                <Link href="/classes">Browse Classes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Upcoming Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/events">
              View Calendar
              <Calendar className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No Upcoming Events</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for upcoming workshops and events
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
