import { Metadata } from "next"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  BookOpen, Clock, Users, Video, MapPin, Calendar,
  ArrowRight, Filter, Search
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export const metadata: Metadata = {
  title: "Classes & Workshops",
  description: "Browse our free and affordable classes on grief counseling, self-help, therapy, and wellness programs.",
}

const categories = [
  { id: "all", label: "All Classes" },
  { id: "grief", label: "Grief & Loss" },
  { id: "dv", label: "Domestic Violence" },
  { id: "self_help", label: "Self-Help" },
  { id: "therapy", label: "Therapy" },
  { id: "wellness", label: "Wellness" },
  { id: "youth", label: "Youth Programs" },
]

// Sample classes for display when database is empty
const sampleClasses = [
  {
    id: "1",
    title: "Healing Through Grief",
    slug: "healing-through-grief",
    description: "A compassionate journey through the grief process. Learn healthy coping strategies and connect with others who understand.",
    category: "grief",
    type: "live",
    price: 0,
    duration_minutes: 90,
    max_participants: 20,
    instructor: { full_name: "Dr. Sarah Mitchell" },
  },
  {
    id: "2",
    title: "Building Resilience",
    slug: "building-resilience",
    description: "Develop mental and emotional strength to overcome life's challenges. Practical techniques for everyday stress management.",
    category: "self_help",
    type: "recorded",
    price: 0,
    duration_minutes: 60,
    max_participants: null,
    instructor: { full_name: "Marcus Johnson" },
  },
  {
    id: "3",
    title: "Safety Planning Workshop",
    slug: "safety-planning-workshop",
    description: "Confidential workshop for domestic violence survivors. Create a personalized safety plan and learn about available resources.",
    category: "dv",
    type: "in_person",
    price: 0,
    duration_minutes: 120,
    max_participants: 15,
    instructor: { full_name: "Angela Torres" },
  },
  {
    id: "4",
    title: "Mindfulness & Meditation",
    slug: "mindfulness-meditation",
    description: "Learn meditation techniques to reduce anxiety and improve mental clarity. Perfect for beginners.",
    category: "wellness",
    type: "live",
    price: 0,
    duration_minutes: 45,
    max_participants: 30,
    instructor: { full_name: "David Chen" },
  },
  {
    id: "5",
    title: "Teen Support Circle",
    slug: "teen-support-circle",
    description: "A safe space for teens to share experiences, build connections, and develop healthy coping skills.",
    category: "youth",
    type: "live",
    price: 0,
    duration_minutes: 60,
    max_participants: 12,
    instructor: { full_name: "Rachel Williams" },
  },
  {
    id: "6",
    title: "Anger Management",
    slug: "anger-management",
    description: "Understanding and managing anger in healthy ways. Learn triggers, techniques, and communication skills.",
    category: "therapy",
    type: "recorded",
    price: 25,
    duration_minutes: 90,
    max_participants: null,
    instructor: { full_name: "Dr. Michael Brown" },
  },
]

function getTypeIcon(type: string) {
  switch (type) {
    case "live":
      return <Video className="h-4 w-4" />
    case "recorded":
      return <BookOpen className="h-4 w-4" />
    case "in_person":
      return <MapPin className="h-4 w-4" />
    default:
      return <BookOpen className="h-4 w-4" />
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
  const cat = categories.find(c => c.id === category)
  return cat?.label || category
}

export default async function ClassesPage() {
  const supabase = await createClient()

  // Fetch classes from database
  const { data: dbClasses } = await supabase
    .from("classes")
    .select(`
      *,
      instructor:profiles(full_name)
    `)
    .eq("is_published", true)
    .order("created_at", { ascending: false })

  // Use database classes if available, otherwise show samples
  const classes = dbClasses && dbClasses.length > 0 ? dbClasses : sampleClasses

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative gradient-sunrise py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200">Classes & Workshops</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl text-slate-900">
                Learn, Grow, and Heal Together
              </h1>
              <p className="mt-6 text-lg text-slate-700">
                Explore our range of classes designed to support your journey toward
                wellness. Most classes are completely free, and all are led by
                experienced professionals who care about your healing.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="border-b border-slate-200 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={cat.id === "all" ? "default" : "outline"}
                    size="sm"
                    className={cat.id === "all" ? "" : "border-slate-300 hover:bg-slate-100 text-slate-700"}
                  >
                    {cat.label}
                  </Button>
                ))}
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search classes..."
                  className="pl-9 border-slate-300 focus:border-teal-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Classes Grid */}
        <section className="py-12 sm:py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {classes.map((classItem) => (
                <Card key={classItem.id} className="flex flex-col shadow-warm hover:shadow-warm-lg transition-all hover-lift border border-slate-200 bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="flex items-center gap-1 bg-slate-100 text-slate-700">
                        {getTypeIcon(classItem.type)}
                        {getTypeLabel(classItem.type)}
                      </Badge>
                      {classItem.price === 0 ? (
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white">Free</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-300 text-slate-700">${classItem.price}</Badge>
                      )}
                    </div>
                    <CardTitle className="line-clamp-2 text-slate-900">{classItem.title}</CardTitle>
                    <CardDescription className="line-clamp-3 text-slate-600">
                      {classItem.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-normal border-slate-300 text-slate-700">
                          {getCategoryLabel(classItem.category)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-500" />
                        <span>{classItem.duration_minutes} minutes</span>
                      </div>
                      {classItem.max_participants && (
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-slate-500" />
                          <span>Max {classItem.max_participants} participants</span>
                        </div>
                      )}
                      {classItem.instructor && (
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-slate-800">
                            Instructor: {classItem.instructor.full_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button asChild className="w-full">
                      <Link href={`/classes/${classItem.slug}`}>
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {classes.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900">No classes available</h3>
                <p className="text-slate-600 mt-2">
                  Check back soon for new classes and workshops.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-slate-50 py-16 border-y border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 mb-4 shadow-warm">
                  <Video className="h-7 w-7 text-teal-700" />
                </div>
                <h3 className="font-semibold text-slate-900">Live Online</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Join interactive sessions from anywhere with our live video classes.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 mb-4 shadow-warm">
                  <BookOpen className="h-7 w-7 text-amber-700" />
                </div>
                <h3 className="font-semibold text-slate-900">On-Demand</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Access recorded content at your own pace, whenever it works for you.
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 mb-4 shadow-warm">
                  <MapPin className="h-7 w-7 text-rose-700" />
                </div>
                <h3 className="font-semibold text-slate-900">In-Person</h3>
                <p className="text-sm text-slate-600 mt-2">
                  Connect face-to-face at our locations in Pomona, Claremont, and La Verna.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-700 py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Have Questions About Our Classes?
            </h2>
            <p className="mt-4 text-lg text-white/95 max-w-2xl mx-auto">
              Our team is here to help you find the right class for your needs.
              Contact us for personalized recommendations.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-slate-100 shadow-warm font-semibold">
                <Link href="/contact">
                  Contact Us
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/20 font-semibold">
                <Link href="/donate">
                  Support Our Mission
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
