import { Metadata } from "next"
import Link from "next/link"
import {
  HeartHandshake,
  ClipboardCheck,
  Users,
  ArrowRight,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  HomeIcon,
  Scale,
  Activity,
  HandHelping,
  FileText,
} from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EcmProvidersSection } from "@/components/home/ecm-providers-section"
import { getVisibleEcmProviders } from "@/lib/queries/ecm"

export const metadata: Metadata = {
  title: "Enhanced Care Management (ECM)",
  description:
    "The Kennedy Austin Foundation is a contracted Enhanced Care Management (ECM) provider, offering a single Lead Care Manager to help Medi-Cal members navigate physical, behavioral, and social services.",
}

const coreServices = [
  {
    icon: Users,
    title: "Outreach & Engagement",
    description:
      "We meet members where they are — at home, in shelters, in clinics — to start the relationship on their terms.",
  },
  {
    icon: ClipboardCheck,
    title: "Comprehensive Assessment & Care Plan",
    description:
      "A whole-person review of medical, behavioral, dental, and social needs, turned into a personalized care plan.",
  },
  {
    icon: HeartHandshake,
    title: "Enhanced Coordination of Care",
    description:
      "Your Lead Care Manager coordinates every appointment, referral, and follow-up across providers.",
  },
  {
    icon: Activity,
    title: "Health Promotion",
    description:
      "Coaching and education on chronic conditions, medications, healthy living, and self-management skills.",
  },
  {
    icon: ShieldCheck,
    title: "Comprehensive Transitional Care",
    description:
      "Support during transitions — hospital discharge, leaving incarceration, moving from shelter to housing.",
  },
  {
    icon: HandHelping,
    title: "Member & Family Supports",
    description:
      "Help for the whole household: caregiver guidance, family education, and grief / crisis support.",
  },
  {
    icon: HomeIcon,
    title: "Community & Social Support Referrals",
    description:
      "Connections to housing, food, transportation, employment, and benefits — the things that drive health.",
  },
]

const populations = [
  {
    icon: HomeIcon,
    title: "Individuals Experiencing Homelessness",
    description: "Adults, youth, and families without stable housing.",
  },
  {
    icon: Scale,
    title: "Justice-Involved Members",
    description:
      "Members transitioning from incarceration or with recent justice-system involvement.",
  },
  {
    icon: Activity,
    title: "High Utilizers of Avoidable Care",
    description:
      "Members with frequent hospital, ER, or short-term skilled-nursing visits.",
  },
  {
    icon: ShieldCheck,
    title: "Serious Mental Illness or SUD",
    description:
      "Adults and youth with serious mental illness or substance use disorders.",
  },
  {
    icon: HeartHandshake,
    title: "Children & Youth in Need",
    description:
      "Children with complex physical, behavioral, developmental, or dental needs.",
  },
  {
    icon: Users,
    title: "Pregnant & Postpartum Members",
    description:
      "Birthing people in or up to 12 months postpartum with complex needs.",
  },
]

export default async function EcmPage() {
  const providers = await getVisibleEcmProviders()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <Badge className="mb-4 bg-teal-100 text-teal-800 border-teal-200">
                Medi-Cal Managed Care Benefit
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                Enhanced Care Management
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-700">
                The Kennedy Austin Foundation is a contracted Enhanced Care Management (ECM)
                provider. We pair members who have complex medical, behavioral, and social
                needs with a single <strong>Lead Care Manager</strong> who walks beside them —
                navigating physical, behavioral, and dental health systems and connecting
                them to the services that change lives.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                {providers.length > 0 && (
                  <Button asChild size="lg" className="shadow-warm hover-lift">
                    <Link href="#providers">
                      Find Your Health Plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                )}
                <Button
                  asChild
                  size="lg"
                  variant={providers.length > 0 ? "outline" : "default"}
                  className={providers.length > 0 ? "hover-lift" : "shadow-warm hover-lift"}
                >
                  <Link href="#refer">Refer a Member</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="hover-lift">
                  <Link href="#contact">Contact ECM Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* What is ECM? */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-start">
              <div>
                <Badge className="mb-3 bg-amber-100 text-amber-800 border-amber-200">
                  About the Program
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  What is ECM?
                </h2>
                <p className="mt-4 text-slate-700">
                  ECM is a state-wide Medi-Cal Managed Care Plan benefit for members with
                  the most complex needs. It replaces fragmented, hard-to-navigate care
                  with a single accountable point of contact — a Lead Care Manager —
                  who knows the member, knows the systems, and stays with them.
                </p>
                <p className="mt-4 text-slate-700">
                  ECM is a no-cost benefit for eligible members. Care is delivered in the
                  community — at home, in shelters, in clinics, and over the phone — at
                  whatever pace and place works best for the member.
                </p>
              </div>
              <Card className="bg-teal-50/60 border-teal-200">
                <CardHeader>
                  <CardTitle className="text-lg">Goals of ECM</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-slate-700">
                    {[
                      "Improve coordination across health and social services",
                      "Address the social drivers of health (housing, food, transport)",
                      "Reduce duplicated and inappropriate services",
                      "Drive better outcomes for high-need members",
                    ].map((g) => (
                      <li key={g} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-teal-700 flex-shrink-0 mt-0.5" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Populations of Focus */}
        <section className="py-16 bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-rose-100 text-rose-800 border-rose-200">
                Who Qualifies
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Populations of Focus
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                ECM is for Medi-Cal Managed Care members in one or more of the following
                populations of focus. Eligibility is confirmed by the member&apos;s
                Managed Care Plan.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {populations.map((p) => (
                <Card key={p.title} className="bg-white border-slate-200 shadow-warm">
                  <CardHeader>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
                      <p.icon className="h-5 w-5 text-rose-700" />
                    </div>
                    <CardTitle className="text-lg text-slate-900">{p.title}</CardTitle>
                    <CardDescription className="text-slate-600">
                      {p.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Seven Core Services */}
        <section className="py-16 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-3 bg-emerald-100 text-emerald-800 border-emerald-200">
                What We Provide
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                The Seven Core ECM Services
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Every ECM provider delivers these seven services, tailored to each
                member&apos;s needs and goals.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {coreServices.map((s, i) => (
                <Card
                  key={s.title}
                  className="hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-100 shadow-warm bg-white"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                        <s.icon className="h-5 w-5 text-teal-700" />
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <CardTitle className="text-lg text-slate-900">{s.title}</CardTitle>
                    <CardDescription className="text-slate-600">
                      {s.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <EcmProvidersSection providers={providers} />

        {/* Refer a member */}
        <section id="refer" className="py-16 bg-gradient-to-b from-amber-50/60 to-white">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-teal-100 text-teal-800 border-teal-200">
                Make a Referral
              </Badge>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Refer a Member to ECM
              </h2>
              <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
                Referrals are accepted from members, family members, providers, and community
                partners. Use the Managed Care Plan&apos;s referral form below.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <Card className="border-teal-200">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                    <FileText className="h-5 w-5 text-teal-700" />
                  </div>
                  <CardTitle>Adult Referral Form</CardTitle>
                  <CardDescription>For members 21 and older.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a
                      href="https://lacare.org/providers/ecm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Adult Form
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
              <Card className="border-rose-200">
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-50">
                    <FileText className="h-5 w-5 text-rose-700" />
                  </div>
                  <CardTitle>Child & Youth Referral Form</CardTitle>
                  <CardDescription>For members under 21.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <a
                      href="https://lacare.org/providers/ecm"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Get Child & Youth Form
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section id="contact" className="py-16 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden">
              <div className="grid lg:grid-cols-2">
                <div className="p-8 lg:p-10">
                  <Badge className="mb-3 bg-rose-100 text-rose-800 border-rose-200">
                    Contact ECM
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    We&apos;re here to help
                  </h2>
                  <p className="mt-3 text-slate-600">
                    Questions about ECM, referrals, or eligibility? Reach out — our team
                    will respond within one business day.
                  </p>
                  <div className="mt-6 space-y-3">
                    <a
                      href="tel:909-808-6866"
                      className="flex items-center gap-3 text-slate-700 hover:text-teal-700"
                    >
                      <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-teal-700" />
                      </div>
                      <span className="font-semibold">909-808-6866</span>
                    </a>
                    <a
                      href="mailto:admin@kennedyaustinfoundation.com?subject=ECM%20Inquiry"
                      className="flex items-center gap-3 text-slate-700 hover:text-teal-700"
                    >
                      <div className="h-9 w-9 rounded-full bg-teal-50 flex items-center justify-center">
                        <Mail className="h-4 w-4 text-teal-700" />
                      </div>
                      <span>admin@kennedyaustinfoundation.com</span>
                    </a>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-teal-600 to-teal-700 p-8 lg:p-10 text-white">
                  <h3 className="text-lg font-semibold mb-3">Justice-Involved Liaison</h3>
                  <p className="text-white/90 text-sm mb-4">
                    For members transitioning from incarceration, LA Care has a
                    dedicated Justice-Involved liaison.
                  </p>
                  <div className="space-y-3">
                    <a
                      href="tel:18445226566"
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Phone className="h-4 w-4" />
                      <span className="font-semibold">1-844-522-6566</span>
                    </a>
                    <a
                      href="mailto:ECM_JI@lacare.org"
                      className="flex items-center gap-3 hover:underline"
                    >
                      <Mail className="h-4 w-4" />
                      <span>ECM_JI@lacare.org</span>
                    </a>
                  </div>
                  <div className="mt-6 pt-6 border-t border-white/20 text-sm text-white/80">
                    General LA Care ECM team:{" "}
                    <a
                      href="mailto:ECM@lacare.org"
                      className="underline hover:text-white"
                    >
                      ECM@lacare.org
                    </a>
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
