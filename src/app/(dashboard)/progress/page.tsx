import { Metadata } from "next"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  Trophy, Target, TrendingUp, BookOpen, Calendar, Star,
  CheckCircle, Clock, Flame
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "My Progress | Dashboard",
}

// Sample achievements
const achievements = [
  {
    id: "first_class",
    title: "First Steps",
    description: "Enrolled in your first class",
    icon: BookOpen,
    unlocked: true,
    date: "Jan 15, 2024",
  },
  {
    id: "journal_streak",
    title: "Consistent Writer",
    description: "Wrote in your journal 7 days in a row",
    icon: Flame,
    unlocked: true,
    date: "Jan 20, 2024",
  },
  {
    id: "class_complete",
    title: "Knowledge Seeker",
    description: "Completed your first class",
    icon: Trophy,
    unlocked: false,
  },
  {
    id: "community_member",
    title: "Community Member",
    description: "Made your first forum post",
    icon: Star,
    unlocked: false,
  },
]

export default async function ProgressPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user stats
  const { count: enrollmentsCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const { count: completedCount } = await supabase
    .from("enrollments")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "completed")

  const { count: journalCount } = await supabase
    .from("journal_entries")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  // Calculate days since joining
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", user.id)
    .single()

  const daysSinceJoining = profile
    ? Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">My Progress</h1>
        <p className="text-slate-600 mt-1">
          Track your growth and celebrate your achievements on your healing journey
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-warm border-amber-100 hover-lift transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Calendar className="h-4 w-4 text-teal-600" />
              Days Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{daysSinceJoining}</div>
            <p className="text-xs text-slate-500">since joining</p>
          </CardContent>
        </Card>
        <Card className="shadow-warm border-amber-100 hover-lift transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Classes Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{enrollmentsCount || 0}</div>
            <p className="text-xs text-slate-500">{completedCount || 0} completed</p>
          </CardContent>
        </Card>
        <Card className="shadow-warm border-amber-100 hover-lift transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Target className="h-4 w-4 text-emerald-600" />
              Journal Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">{journalCount || 0}</div>
            <p className="text-xs text-slate-500">reflections written</p>
          </CardContent>
        </Card>
        <Card className="shadow-warm border-amber-100 hover-lift transition-all">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-slate-700">
              <Trophy className="h-4 w-4 text-amber-600" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-800">
              {achievements.filter(a => a.unlocked).length}/{achievements.length}
            </div>
            <p className="text-xs text-slate-500">unlocked</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Goals */}
      <Card className="shadow-warm border-amber-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <Target className="h-5 w-5 text-teal-600" />
            Weekly Goals
          </CardTitle>
          <CardDescription className="text-slate-600">
            Stay on track with your wellness journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Complete 1 class lesson</span>
              <span className="text-muted-foreground">0/1</span>
            </div>
            <Progress value={0} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Write 3 journal entries</span>
              <span className="text-muted-foreground">
                {Math.min(journalCount || 0, 3)}/3
              </span>
            </div>
            <Progress value={Math.min(((journalCount || 0) / 3) * 100, 100)} />
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Attend 1 live session or event</span>
              <span className="text-muted-foreground">0/1</span>
            </div>
            <Progress value={0} />
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-800">
          <Trophy className="h-5 w-5 text-amber-500" />
          Achievements
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {achievements.map((achievement) => {
            const Icon = achievement.icon
            return (
              <Card
                key={achievement.id}
                className={`shadow-warm border-amber-100 hover-lift transition-all ${achievement.unlocked ? "" : "opacity-60"}`}
              >
                <CardContent className="pt-6 text-center">
                  <div
                    className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center shadow-warm ${
                      achievement.unlocked
                        ? "bg-gradient-to-br from-amber-100 to-orange-100"
                        : "bg-slate-100"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        achievement.unlocked
                          ? "text-amber-600"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                  <h3 className="font-semibold mt-4 text-slate-800">{achievement.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    {achievement.description}
                  </p>
                  {achievement.unlocked && achievement.date && (
                    <Badge variant="secondary" className="mt-3 bg-emerald-100 text-emerald-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {achievement.date}
                    </Badge>
                  )}
                  {!achievement.unlocked && (
                    <Badge variant="outline" className="mt-3 border-slate-300 text-slate-500">
                      <Clock className="h-3 w-3 mr-1" />
                      Locked
                    </Badge>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Activity Timeline */}
      <Card className="shadow-warm border-amber-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-800">
            <TrendingUp className="h-5 w-5 text-teal-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { action: "Joined the platform", time: `${daysSinceJoining} days ago`, icon: Star },
              { action: "Completed profile setup", time: `${daysSinceJoining} days ago`, icon: CheckCircle },
            ].map((activity, index) => {
              const Icon = activity.icon
              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center shadow-warm">
                    <Icon className="h-5 w-5 text-teal-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{activity.action}</p>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
