import { Metadata } from "next"
import Link from "next/link"
import { Heart, Award, Calendar, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedValues, getPublishedMilestones } from "@/lib/queries/cms"
import { getIcon } from "@/lib/icon-registry"

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about the Kennedy Austin Foundation's mission, history, and the team dedicated to supporting families through crisis.",
}

export default async function AboutPage() {
  const [values, milestones] = await Promise.all([
    getPublishedValues(),
    getPublishedMilestones(),
  ])
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Our Story</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Transforming Grief Into Hope Since 1993
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                The Kennedy Austin Foundation was born from one mother&apos;s determination
                to ensure no family faces crisis alone. For over 30 years, we have been
                a beacon of support for the Tri-City community.
              </p>
            </div>
          </div>
        </section>

        {/* Founder Story Section */}
        <section className="py-16 sm:py-24" id="story">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="relative">
                <div className="aspect-[4/5] rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Heart className="h-20 w-20 text-primary/50 mx-auto mb-4" />
                    <p className="text-lg font-medium text-primary/70">
                      &ldquo;In memory of Kennedy Austin&rdquo;
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  A Mother&apos;s Love, A Community&apos;s Strength
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
                  <p>
                    In 1993, Ms. Ethel Gardner experienced every parent&apos;s worst
                    nightmare&mdash;the loss of her teenage son, Kennedy Austin. In the
                    depths of her grief, she discovered a profound truth: healing comes
                    through helping others.
                  </p>
                  <p>
                    Rather than letting her pain consume her, Ms. Gardner channeled it
                    into a mission of hope. She founded the Kennedy Austin Foundation
                    as a family crisis intervention center, partnering with the City
                    of Pomona as a &ldquo;first responder&rdquo; to families in crisis.
                  </p>
                  <p>
                    Her dedication has not gone unnoticed. Ms. Gardner was named
                    Pomona&apos;s &ldquo;Hero of the Year&rdquo; and later recognized as
                    California&apos;s &ldquo;2015 Woman of the Year&rdquo; for her
                    tireless service to the community.
                  </p>
                  <p>
                    Today, the Kennedy Austin Foundation continues to serve Pomona,
                    Claremont, and La Verna, California, providing free crisis
                    intervention, grief counseling, and support services to youth
                    and families navigating life&apos;s most challenging moments.
                  </p>
                </div>
                <div className="mt-8 flex items-center gap-4 p-4 bg-muted rounded-lg">
                  <Award className="h-12 w-12 text-amber-500 flex-shrink-0" />
                  <div>
                    <div className="font-semibold">California&apos;s 2015 Woman of the Year</div>
                    <div className="text-sm text-muted-foreground">
                      Ms. Ethel Gardner, Founder & Executive Director
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted/50 py-16 sm:py-24" id="mission">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4">Our Mission</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Supporting Youth and Families Through the Traumas of Life and Loss
              </h2>
              <p className="mt-6 text-lg text-muted-foreground">
                We exist to provide compassionate crisis intervention, grief counseling,
                and family support services to those who need them most&mdash;regardless
                of their ability to pay.
              </p>
            </div>

            {values.length > 0 && (
              <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                {values.map((value) => {
                  const Icon = getIcon(value.icon_name, Heart)
                  return (
                    <Card key={value.id} className="text-center">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <CardTitle>{value.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <CardDescription>{value.description}</CardDescription>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge className="mb-4">Our Journey</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                30+ Years of Service
              </h2>
            </div>

            <div className="relative">
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-border" />
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.id}
                    className={`relative flex items-center gap-4 md:gap-8 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"} hidden md:block`}>
                      {index % 2 === 0 && (
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold z-10">
                        <Calendar className="h-4 w-4" />
                      </div>
                    </div>

                    <div className={`flex-1 ${index % 2 === 1 ? "md:text-right" : "md:text-left"}`}>
                      <div className="pl-8 md:pl-0">
                        <span className="text-sm font-bold text-primary">{milestone.year}</span>
                        <Card className="mt-2 md:hidden">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">
                              {milestone.description}
                            </p>
                          </CardContent>
                        </Card>
                        {index % 2 === 1 && (
                          <Card className="hidden md:block mt-2">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{milestone.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground">
                                {milestone.description}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Join Our Mission
            </h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              Whether you need support, want to volunteer, or wish to donate,
              there&apos;s a place for you in our community.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90">
                <Link href="/services">
                  Get Support
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Link href="/donate">
                  <Heart className="mr-2 h-4 w-4" />
                  Support Our Work
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
