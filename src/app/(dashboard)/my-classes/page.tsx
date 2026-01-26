import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import {
  BookOpen, Clock, Play, CheckCircle, ArrowRight, Video, MapPin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const metadata: Metadata = {
  title: "My Classes | Dashboard",
}

function getTypeIcon(type: string) {
  switch (type) {
    case "live":
      return <Video className="h-4 w-4" />
    case "in_person":
      return <MapPin className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
  }
}

export default async function MyClassesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch user's enrollments with class details
  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(`
      *,
      class:classes(*)
    `)
    .eq("user_id", user.id)
    .order("enrolled_at", { ascending: false })

  const inProgress = enrollments?.filter(e => e.status === "enrolled") || []
  const completed = enrollments?.filter(e => e.status === "completed") || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Classes</h1>
          <p className="text-slate-700 mt-1">
            Track your enrolled classes and continue your learning journey
          </p>
        </div>
        <Button asChild className="shadow-warm">
          <Link href="/classes">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Classes
          </Link>
        </Button>
      </div>

      {/* In Progress Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900">
          <Play className="h-5 w-5 text-teal-700" />
          In Progress ({inProgress.length})
        </h2>

        {inProgress.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inProgress.map((enrollment) => (
              <Card key={enrollment.id} className="flex flex-col shadow-warm border border-slate-200 hover-lift transition-all bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      {getTypeIcon(enrollment.class?.type)}
                      {enrollment.class?.type}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-1">
                    {enrollment.class?.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {enrollment.class?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress_percent || 0}%</span>
                      </div>
                      <Progress value={enrollment.progress_percent || 0} />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {enrollment.class?.duration_minutes} minutes
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full">
                    <Link href={`/classes/${enrollment.class?.slug}`}>
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-warm border border-slate-200 bg-white">
            <CardContent className="py-12 text-center">
              <BookOpen className="h-12 w-12 text-teal-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg text-slate-900">No classes in progress</h3>
              <p className="text-slate-600 mt-2 mb-4">
                Start your learning journey by enrolling in a class
              </p>
              <Button asChild className="shadow-warm">
                <Link href="/classes">Browse Classes</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      {/* Completed Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900">
          <CheckCircle className="h-5 w-5 text-emerald-600" />
          Completed ({completed.length})
        </h2>

        {completed.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completed.map((enrollment) => (
              <Card key={enrollment.id} className="flex flex-col shadow-warm border border-slate-200 bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className="bg-emerald-500">Completed</Badge>
                  </div>
                  <CardTitle className="line-clamp-1">
                    {enrollment.class?.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Completed on {new Date(enrollment.completed_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={`/classes/${enrollment.class?.slug}`}>
                      Review Class
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-warm border border-slate-200 bg-white">
            <CardContent className="py-8 text-center">
              <p className="text-slate-600">
                Classes you complete will appear here
              </p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
