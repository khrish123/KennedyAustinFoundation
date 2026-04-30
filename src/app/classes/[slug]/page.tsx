import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  BookOpen, Clock, Users, Video, MapPin, Calendar, ArrowLeft,
  CheckCircle, Play, User, Star
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Sample classes for when DB is empty
const sampleClasses: Record<string, {
  id: string
  title: string
  slug: string
  description: string
  category: string
  type: string
  price: number
  duration_minutes: number
  max_participants: number | null
  instructor: { full_name: string }
  features: string[]
  syllabus: { title: string; duration: string }[]
}> = {
  "healing-through-grief": {
    id: "1",
    title: "Healing Through Grief",
    slug: "healing-through-grief",
    description: "A compassionate journey through the grief process. Learn healthy coping strategies and connect with others who understand. This course provides tools and techniques for processing loss in a healthy way.",
    category: "grief",
    type: "live",
    price: 0,
    duration_minutes: 90,
    max_participants: 20,
    instructor: { full_name: "Dr. Sarah Mitchell" },
    features: [
      "Live interactive sessions",
      "Small group discussions",
      "Personal reflection exercises",
      "Resource materials provided",
      "Certificate of completion",
    ],
    syllabus: [
      { title: "Understanding Grief", duration: "15 min" },
      { title: "The Stages of Loss", duration: "20 min" },
      { title: "Coping Strategies", duration: "25 min" },
      { title: "Building Support Systems", duration: "20 min" },
      { title: "Moving Forward", duration: "10 min" },
    ],
  },
  "building-resilience": {
    id: "2",
    title: "Building Resilience",
    slug: "building-resilience",
    description: "Develop mental and emotional strength to overcome life's challenges. Practical techniques for everyday stress management and building a resilient mindset.",
    category: "self_help",
    type: "recorded",
    price: 0,
    duration_minutes: 60,
    max_participants: null,
    instructor: { full_name: "Marcus Johnson" },
    features: [
      "Self-paced learning",
      "Downloadable worksheets",
      "Lifetime access",
      "Mobile-friendly",
      "Progress tracking",
    ],
    syllabus: [
      { title: "What is Resilience?", duration: "10 min" },
      { title: "Identifying Your Strengths", duration: "15 min" },
      { title: "Stress Management Techniques", duration: "20 min" },
      { title: "Building Mental Toughness", duration: "15 min" },
    ],
  },
  "safety-planning-workshop": {
    id: "3",
    title: "Safety Planning Workshop",
    slug: "safety-planning-workshop",
    description: "Confidential workshop for domestic violence survivors. Create a personalized safety plan and learn about available resources in your community.",
    category: "dv",
    type: "in_person",
    price: 0,
    duration_minutes: 120,
    max_participants: 15,
    instructor: { full_name: "Angela Torres" },
    features: [
      "Confidential environment",
      "One-on-one support available",
      "Resource packet provided",
      "Follow-up support",
      "Referrals to local services",
    ],
    syllabus: [
      { title: "Understanding Safety Planning", duration: "20 min" },
      { title: "Assessing Your Situation", duration: "30 min" },
      { title: "Creating Your Safety Plan", duration: "40 min" },
      { title: "Resources and Support", duration: "30 min" },
    ],
  },
  "mindfulness-meditation": {
    id: "4",
    title: "Mindfulness & Meditation",
    slug: "mindfulness-meditation",
    description: "Learn meditation techniques to reduce anxiety and improve mental clarity. Perfect for beginners looking to start a mindfulness practice.",
    category: "wellness",
    type: "live",
    price: 0,
    duration_minutes: 45,
    max_participants: 30,
    instructor: { full_name: "David Chen" },
    features: [
      "Guided meditation sessions",
      "Breathing techniques",
      "Daily practice tips",
      "Recording for home practice",
      "Q&A with instructor",
    ],
    syllabus: [
      { title: "Introduction to Mindfulness", duration: "10 min" },
      { title: "Breathing Exercises", duration: "10 min" },
      { title: "Guided Meditation", duration: "15 min" },
      { title: "Building a Daily Practice", duration: "10 min" },
    ],
  },
  "teen-support-circle": {
    id: "5",
    title: "Teen Support Circle",
    slug: "teen-support-circle",
    description: "A safe space for teens to share experiences, build connections, and develop healthy coping skills with peers who understand.",
    category: "youth",
    type: "live",
    price: 0,
    duration_minutes: 60,
    max_participants: 12,
    instructor: { full_name: "Rachel Williams" },
    features: [
      "Age-appropriate content",
      "Peer support environment",
      "Creative expression activities",
      "Confidential discussions",
      "Parent resources available",
    ],
    syllabus: [
      { title: "Introductions & Ice Breakers", duration: "10 min" },
      { title: "Topic Discussion", duration: "25 min" },
      { title: "Group Activity", duration: "15 min" },
      { title: "Closing & Reflection", duration: "10 min" },
    ],
  },
  "anger-management": {
    id: "6",
    title: "Anger Management",
    slug: "anger-management",
    description: "Understanding and managing anger in healthy ways. Learn triggers, techniques, and communication skills to express emotions constructively.",
    category: "therapy",
    type: "recorded",
    price: 25,
    duration_minutes: 90,
    max_participants: null,
    instructor: { full_name: "Dr. Michael Brown" },
    features: [
      "Evidence-based techniques",
      "Personal trigger assessment",
      "Communication strategies",
      "Workbook included",
      "Certificate of completion",
    ],
    syllabus: [
      { title: "Understanding Anger", duration: "20 min" },
      { title: "Identifying Triggers", duration: "20 min" },
      { title: "Healthy Expression Techniques", duration: "25 min" },
      { title: "Communication Skills", duration: "25 min" },
    ],
  },
}

function getTypeIcon(type: string) {
  switch (type) {
    case "live":
      return <Video className="h-5 w-5" />
    case "in_person":
      return <MapPin className="h-5 w-5" />
    default:
      return <BookOpen className="h-5 w-5" />
  }
}

function getTypeLabel(type: string) {
  switch (type) {
    case "live":
      return "Live Online"
    case "recorded":
      return "On-Demand"
    case "in_person":
      return "In-Person"
    default:
      return type
  }
}

function getCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    grief: "Grief & Loss",
    dv: "Domestic Violence",
    self_help: "Self-Help",
    therapy: "Therapy",
    wellness: "Wellness",
    youth: "Youth Programs",
  }
  return labels[category] || category
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const classData = sampleClasses[slug]

  return {
    title: classData ? `${classData.title} | Classes` : "Class Not Found",
    description: classData?.description,
  }
}

export default async function ClassDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  // Try to fetch from database first
  const { data: dbClass } = await supabase
    .from("classes")
    .select(`
      *,
      instructor:profiles(full_name, avatar_url)
    `)
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  // Use DB class or fall back to sample
  const classData = dbClass || sampleClasses[slug]

  if (!classData) {
    notFound()
  }

  // Check if user is enrolled
  const { data: { user } } = await supabase.auth.getUser()
  let isEnrolled = false

  if (user) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("id")
      .eq("user_id", user.id)
      .eq("class_id", classData.id)
      .single()

    isEnrolled = !!enrollment
  }

  const features = classData.features || [
    "Expert instruction",
    "Interactive content",
    "Resource materials",
    "Certificate of completion",
  ]

  const syllabus = classData.syllabus || [
    { title: "Introduction", duration: "10 min" },
    { title: "Main Content", duration: "40 min" },
    { title: "Practice & Discussion", duration: "30 min" },
    { title: "Closing", duration: "10 min" },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-muted/50 border-b">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <Link
              href="/classes"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Classes
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getTypeIcon(classData.type)}
                    {getTypeLabel(classData.type)}
                  </Badge>
                  <Badge variant="outline">
                    {getCategoryLabel(classData.category)}
                  </Badge>
                  {classData.price === 0 && (
                    <Badge className="bg-emerald-500">Free</Badge>
                  )}
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {classData.title}
                </h1>
                <p className="mt-4 text-lg text-muted-foreground">
                  {classData.description}
                </p>
                <div className="mt-6 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    {classData.duration_minutes} minutes
                  </div>
                  {classData.max_participants && (
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      Max {classData.max_participants} participants
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-muted-foreground" />
                    {classData.instructor?.full_name || "Kennedy Austin Foundation"}
                  </div>
                </div>
              </div>

              {/* Enrollment Card */}
              <Card className="lg:sticky lg:top-24 h-fit">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {classData.price === 0 ? "Free" : `$${classData.price}`}
                  </CardTitle>
                  <CardDescription>
                    {classData.type === "recorded"
                      ? "Lifetime access"
                      : "Enroll in this class"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEnrolled ? (
                    <>
                      <Button className="w-full" size="lg">
                        <Play className="mr-2 h-5 w-5" />
                        Continue Learning
                      </Button>
                      <p className="text-sm text-center text-muted-foreground">
                        You&apos;re enrolled in this class
                      </p>
                    </>
                  ) : (
                    <>
                      <Button className="w-full" size="lg" asChild>
                        <Link href={user ? "#enroll" : `/login?redirect=/classes/${slug}`}>
                          {classData.price === 0 ? "Enroll for Free" : "Enroll Now"}
                        </Link>
                      </Button>
                      {!user && (
                        <p className="text-sm text-center text-muted-foreground">
                          <Link href="/login" className="text-primary hover:underline">
                            Sign in
                          </Link>{" "}
                          to enroll in this class
                        </p>
                      )}
                    </>
                  )}
                  <Separator />
                  <div className="space-y-2">
                    <p className="font-medium">This class includes:</p>
                    <ul className="space-y-2 text-sm">
                      {features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-emerald-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-8">
                {/* About */}
                <Card>
                  <CardHeader>
                    <CardTitle>About This Class</CardTitle>
                  </CardHeader>
                  <CardContent className="prose dark:prose-invert max-w-none">
                    <p>{classData.description}</p>
                    <p>
                      Join us for this transformative experience designed to support your
                      journey toward healing and growth. Our experienced instructors
                      create a safe, supportive environment for learning and connection.
                    </p>
                  </CardContent>
                </Card>

                {/* Syllabus */}
                <Card>
                  <CardHeader>
                    <CardTitle>Class Outline</CardTitle>
                    <CardDescription>
                      What you&apos;ll learn in this class
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {syllabus.map((item: { title: string; duration: string }, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </div>
                            <span className="font-medium">{item.title}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {item.duration}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Instructor */}
                <Card>
                  <CardHeader>
                    <CardTitle>Your Instructor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">
                          {classData.instructor?.full_name || "Kennedy Austin Foundation"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Experienced facilitator and wellness educator
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - visible on mobile */}
              <div className="lg:hidden">
                {/* Mobile enrollment card would go here if needed */}
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
