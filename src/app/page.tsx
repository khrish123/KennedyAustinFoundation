import Link from "next/link"
import {
  Heart,
  Users,
  BookOpen,
  MessageCircle,
  Shield,
  Sparkles,
  ArrowRight,
  Phone,
  Calendar,
  Award,
  Sun,
  Leaf,
  HandHeart
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HeroSlider } from "@/components/home/hero-slider"
import { UpcomingEvents } from "@/components/home/upcoming-events"
import { getActiveHeroSlides, getUpcomingEvents } from "@/lib/queries/home"
import { getPublishedServices } from "@/lib/queries/cms"
import { getIcon } from "@/lib/icon-registry"

const services = [
  {
    icon: Shield,
    title: "Crisis Intervention",
    description: "Compassionate support during life's most difficult moments. You're not alone—we're here 24/7.",
    href: "/services#crisis",
    color: "text-rose-500",
    bgColor: "bg-rose-50",
  },
  {
    icon: Heart,
    title: "Grief Counseling",
    description: "Gentle guidance through the journey of loss, helping you find peace and healing.",
    href: "/services#grief",
    color: "text-purple-500",
    bgColor: "bg-purple-50",
  },
  {
    icon: HandHeart,
    title: "DV Support",
    description: "A safe haven for survivors, offering hope, resources, and a path to safety.",
    href: "/services#dv",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
  },
  {
    icon: Sparkles,
    title: "Self-Help Programs",
    description: "Discover your inner strength through empowering workshops and wellness programs.",
    href: "/services#selfhelp",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
  },
  {
    icon: BookOpen,
    title: "Educational Classes",
    description: "Learn and grow with courses designed to nurture your mind, body, and spirit.",
    href: "/classes",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50",
  },
  {
    icon: Users,
    title: "Community Support",
    description: "Connect with others who understand. Together, we heal stronger.",
    href: "/community",
    color: "text-teal-500",
    bgColor: "bg-teal-50",
  },
]

const stats = [
  { value: "30+", label: "Years of Hope", icon: Sun },
  { value: "10,000+", label: "Lives Touched", icon: Heart },
  { value: "Free", label: "Core Services", icon: Leaf },
  { value: "24/7", label: "Always Here", icon: Phone },
]

const upcomingClasses = [
  {
    title: "Healing Through Grief",
    category: "Grief",
    date: "Weekly on Tuesdays",
    type: "Live",
    color: "bg-purple-100 text-purple-700",
  },
  {
    title: "Building Resilience",
    category: "Self-Help",
    date: "Starting Feb 15",
    type: "Course",
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Family Wellness Workshop",
    category: "Therapy",
    date: "Monthly",
    type: "In-Person",
    color: "bg-emerald-100 text-emerald-700",
  },
]

export default async function HomePage() {
  const [slides, upcomingEvents, dbServices] = await Promise.all([
    getActiveHeroSlides(),
    getUpcomingEvents(3),
    getPublishedServices(),
  ])

  const homepageServices = dbServices.length > 0 ? dbServices : null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <HeroSlider slides={slides} />

        {/* Stats Section - Warm tones */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center group">
                  <div className="mx-auto w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center mb-3 group-hover:bg-teal-200 transition-colors">
                    <stat.icon className="h-7 w-7 text-teal-700" />
                  </div>
                  <div className="text-3xl font-bold text-teal-700 sm:text-4xl">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-slate-600 font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Encouraging Message Banner */}
        <section className="py-10 bg-gradient-to-r from-teal-50 via-amber-50 to-teal-50">
          <div className="mx-auto max-w-4xl px-4 text-center">
            <p className="text-xl md:text-2xl text-slate-800 font-medium italic">
              &ldquo;Every sunrise brings new hope. Every step forward is a victory.
              Your healing journey starts with the courage to reach out.&rdquo;
            </p>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-amber-100 text-amber-800 border-amber-200">
                Our Services
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                How We Can Support You
              </h2>
              <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
                Whatever you&apos;re facing, we offer compassionate care and practical resources
                to help you move toward healing and hope.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(homepageServices
                ? homepageServices.map((s) => ({
                    title: s.title,
                    description: s.short_description || "",
                    href: s.href_anchor ? `/services#${s.href_anchor}` : "/services",
                    icon: getIcon(s.icon_name),
                    color: s.color_class || "text-teal-700",
                    bgColor: s.bg_color_class || "bg-teal-50",
                  }))
                : services
              ).map((service) => (
                <Card
                  key={service.title}
                  className="group hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-100 shadow-warm bg-white"
                >
                  <CardHeader>
                    <div
                      className={`w-14 h-14 rounded-xl ${service.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                    >
                      <service.icon className={`h-7 w-7 ${service.color}`} />
                    </div>
                    <CardTitle className="group-hover:text-teal-700 transition-colors text-xl text-slate-900">
                      {service.title}
                    </CardTitle>
                    <CardDescription className="text-base text-slate-600">
                      {service.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Link
                      href={service.href}
                      className="text-sm font-medium text-teal-700 hover:underline inline-flex items-center group/link"
                    >
                      Learn more
                      <ArrowRight className="ml-1 h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* About Preview Section - Warmer */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-amber-50/70 to-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div>
                <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200">Our Story</Badge>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Born from Love, Growing in Hope
                </h2>
                <p className="mt-4 text-slate-700 text-lg">
                  In 1993, after the heartbreaking loss of her teenage son Kennedy Austin,
                  Ms. Ethel Gardner chose to transform her grief into a gift for others.
                  She founded the Kennedy Austin Foundation so no family would ever
                  have to face their darkest moments alone.
                </p>
                <p className="mt-4 text-slate-600">
                  Today, we carry forward her legacy of love, serving the
                  Tri-City community—Pomona, Claremont, and La Verna, California—with
                  free support services that have touched over 10,000 lives.
                </p>
                <div className="mt-8 p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-warm">
                  <div className="flex items-center gap-4">
                    <Award className="h-12 w-12 text-amber-600" />
                    <div>
                      <div className="font-semibold text-slate-900">California&apos;s 2015 Woman of the Year</div>
                      <div className="text-sm text-slate-600">
                        Ms. Ethel Gardner, Founder
                      </div>
                    </div>
                  </div>
                </div>
                <Button asChild className="mt-6 hover-lift">
                  <Link href="/about">
                    Read Our Full Story
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl bg-gradient-to-br from-teal-100 via-amber-100 to-rose-100 flex items-center justify-center shadow-warm-lg">
                  <div className="text-center p-8">
                    <Heart className="h-24 w-24 text-teal-600 mx-auto mb-4" />
                    <p className="text-xl font-medium text-slate-800">
                      &ldquo;From grief to grace, we walk together.&rdquo;
                    </p>
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-amber-200/50 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-teal-200/30 rounded-full blur-xl" />
              </div>
            </div>
          </div>
        </section>

        <UpcomingEvents events={upcomingEvents} />

        {/* Upcoming Classes Section */}
        <section className="py-16 sm:py-24 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-12">
              <div>
                <Badge className="mb-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                  Learn & Grow
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Nurture Your Journey
                </h2>
                <p className="mt-2 text-slate-600">
                  Free and affordable classes to support your growth
                </p>
              </div>
              <Button asChild variant="outline" className="mt-4 sm:mt-0 hover-lift border-slate-300">
                <Link href="/classes">
                  View All Classes
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingClasses.map((cls) => (
                <Card key={cls.title} className="hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-100 shadow-warm bg-white">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge className={cls.color}>{cls.category}</Badge>
                      <Badge variant="outline" className="border-slate-300 text-slate-700">{cls.type}</Badge>
                    </div>
                    <CardTitle className="mt-3 text-xl text-slate-900">{cls.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-sm text-slate-600 mb-4">
                      <Calendar className="mr-2 h-4 w-4 text-teal-600" />
                      {cls.date}
                    </div>
                    <Button asChild className="w-full">
                      <Link href="/classes">Learn More</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* AI Chat CTA Section - Softer, more inviting */}
        <section className="py-16 bg-gradient-to-r from-primary via-teal-500 to-primary">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 mb-6">
              <MessageCircle className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-white">
              Need a Listening Ear?
            </h2>
            <p className="mt-4 text-lg text-white/90 max-w-2xl mx-auto">
              Our compassionate AI assistant is here 24/7 to offer support, share resources,
              and help you find the services you need. Take the first step when you&apos;re ready.
            </p>
            <Button asChild size="lg" className="mt-8 bg-white text-primary hover:bg-white/90 shadow-warm hover-lift">
              <Link href="/chat">
                <Heart className="mr-2 h-4 w-4" />
                Start a Conversation
              </Link>
            </Button>
            <p className="mt-4 text-sm text-white/70">
              For emergencies, please call 911 or our crisis line: 909-808-6866
            </p>
          </div>
        </section>

        {/* Donate CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-amber-50/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden shadow-warm-lg border border-slate-100">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-12 bg-white">
                  <Badge className="mb-4 bg-rose-100 text-rose-800 border-rose-200">
                    Make a Difference
                  </Badge>
                  <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                    Your Generosity Creates Hope
                  </h2>
                  <p className="mt-4 text-slate-700 text-lg">
                    When you give to the Kennedy Austin Foundation, you&apos;re not just donating—
                    you&apos;re wrapping someone in support during their hardest days.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {[
                      "Provide free grief counseling to a grieving family",
                      "Support survivors of domestic violence",
                      "Fund youth programs that build resilience",
                      "Enable free classes for personal growth",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <Heart className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button asChild size="lg" className="hover-lift">
                      <Link href="/donate">
                        <Heart className="mr-2 h-4 w-4" />
                        Give Hope Today
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="hover-lift border-slate-300">
                      <Link href="/donate#monthly">
                        Become a Monthly Supporter
                      </Link>
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 lg:p-12 flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-7xl font-bold">100%</div>
                    <div className="mt-3 text-xl">
                      of donations support<br />our programs directly
                    </div>
                    <div className="mt-6 p-4 bg-white/20 rounded-xl">
                      <p className="text-sm">
                        Every dollar you give helps someone heal.
                        Thank you for being part of our community of hope.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
