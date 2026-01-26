import { Metadata } from "next"
import Link from "next/link"
import {
  Shield, Heart, Users, Sparkles, BookOpen, Phone,
  ArrowRight, CheckCircle, Clock, MapPin
} from "lucide-react"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata: Metadata = {
  title: "Our Services",
  description: "Free crisis intervention, grief counseling, domestic violence support, and wellness programs for youth and families.",
}

const services = [
  {
    id: "crisis",
    icon: Shield,
    title: "Crisis Intervention",
    description: "Immediate support during life's most difficult moments",
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
    features: [
      "24/7 crisis hotline support",
      "Same-day response for urgent situations",
      "Safety planning and resources",
      "Connection to emergency services when needed",
      "Follow-up care and support",
    ],
    details: "Our crisis intervention team is available around the clock to provide immediate support during emergencies. We partner with local emergency services to ensure you get the help you need, when you need it.",
  },
  {
    id: "grief",
    icon: Heart,
    title: "Grief Counseling",
    description: "Compassionate support for those navigating loss",
    color: "text-purple-500",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    features: [
      "Individual counseling sessions",
      "Group support meetings",
      "Child and teen grief programs",
      "Family grief support",
      "Memorial and remembrance events",
    ],
    details: "In partnership with Tri-City Mental Health Services, we provide comprehensive grief counseling for individuals and families. Our trained counselors help you process your loss and find a path toward healing.",
  },
  {
    id: "dv",
    icon: Users,
    title: "Domestic Violence Support",
    description: "A safe space for survivors and their families",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    features: [
      "Confidential support services",
      "Safety planning assistance",
      "Resource referrals and advocacy",
      "Support groups for survivors",
      "Children's programs",
    ],
    details: "We provide a safe, judgment-free environment for domestic violence survivors. Our services include safety planning, resource connections, and ongoing support as you rebuild your life.",
  },
  {
    id: "selfhelp",
    icon: Sparkles,
    title: "Self-Help Programs",
    description: "Tools and skills for personal growth",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-950",
    features: [
      "Personal development workshops",
      "Stress management techniques",
      "Building healthy relationships",
      "Life skills training",
      "Goal setting and achievement",
    ],
    details: "Our self-help programs empower you with practical skills and strategies for personal growth. From stress management to relationship building, we provide tools for lasting positive change.",
  },
  {
    id: "youth",
    icon: BookOpen,
    title: "Youth Programs",
    description: "Specialized support for young people",
    color: "text-emerald-500",
    bgColor: "bg-emerald-50 dark:bg-emerald-950",
    features: [
      "Youth mentorship programs",
      "After-school support groups",
      "Teen crisis intervention",
      "College and career guidance",
      "Leadership development",
    ],
    details: "Our youth programs provide specialized support for young people facing challenges. We help them build resilience, develop leadership skills, and navigate the path to adulthood.",
  },
  {
    id: "family",
    icon: Users,
    title: "Family Support",
    description: "Strengthening families through support",
    color: "text-cyan-500",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    features: [
      "Family counseling sessions",
      "Parenting workshops",
      "Communication skills training",
      "Conflict resolution support",
      "Resource assistance (food, clothing, shelter)",
    ],
    details: "Strong families build strong communities. Our family support services help families communicate better, resolve conflicts, and access the resources they need to thrive.",
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Our Services</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Comprehensive Support for Every Journey
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                All of our core services are provided free of charge. We believe everyone
                deserves access to quality support, regardless of their financial situation.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg">
                  <Link href="/contact">
                    <Phone className="mr-2 h-4 w-4" />
                    Contact Us
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/classes">
                    Browse Classes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Info */}
        <section className="bg-muted/50 py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-3">
                <Phone className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-semibold">Crisis Hotline</div>
                  <a href="tel:909-808-6866" className="text-primary hover:underline">
                    909-808-6866
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-semibold">Hours</div>
                  <div className="text-muted-foreground">24/7 Crisis Support</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-8 w-8 text-primary" />
                <div>
                  <div className="font-semibold">Serving</div>
                  <div className="text-muted-foreground">Pomona, Claremont, La Verna</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services List */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-24">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  id={service.id}
                  className={`grid gap-12 lg:grid-cols-2 items-center ${
                    index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                  }`}
                >
                  <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                    <div className={`inline-flex p-3 rounded-xl ${service.bgColor} mb-4`}>
                      <service.icon className={`h-8 w-8 ${service.color}`} />
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {service.title}
                    </h2>
                    <p className="mt-2 text-lg text-muted-foreground">
                      {service.description}
                    </p>
                    <p className="mt-4 text-muted-foreground">
                      {service.details}
                    </p>
                    <ul className="mt-6 space-y-3">
                      {service.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button asChild className="mt-6">
                      <Link href="/contact">
                        Get Started
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                    <Card className="overflow-hidden">
                      <div className={`h-64 ${service.bgColor} flex items-center justify-center`}>
                        <service.icon className={`h-24 w-24 ${service.color} opacity-50`} />
                      </div>
                    </Card>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to Take the First Step?
            </h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              Reaching out is the hardest part. Our compassionate team is here to
              listen and help you find the support you need.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <a href="tel:909-808-6866">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Now
                </a>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
