import { Metadata } from "next"
import Link from "next/link"
import { Phone, ArrowRight, CheckCircle, Clock, MapPin } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedServices } from "@/lib/queries/cms"
import { getIcon } from "@/lib/icon-registry"

export const metadata: Metadata = {
  title: "Our Services",
  description: "Free crisis intervention, grief counseling, domestic violence support, and wellness programs for youth and families.",
}

export default async function ServicesPage() {
  const services = await getPublishedServices()
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

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
            {services.length === 0 ? (
              <p className="text-center text-muted-foreground">
                Our services are being updated. Please check back soon, or{" "}
                <Link href="/contact" className="text-teal-700 underline">
                  contact us
                </Link>{" "}
                to learn about what&apos;s available today.
              </p>
            ) : (
              <div className="space-y-24">
                {services.map((service, index) => {
                  const Icon = getIcon(service.icon_name)
                  const bg = service.bg_color_class || "bg-teal-50"
                  const color = service.color_class || "text-teal-700"
                  const anchor = service.href_anchor || service.slug
                  return (
                    <div
                      key={service.id}
                      id={anchor}
                      className={`grid gap-12 lg:grid-cols-2 items-center ${
                        index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
                      }`}
                    >
                      <div className={index % 2 === 1 ? "lg:col-start-2" : ""}>
                        <div className={`inline-flex p-3 rounded-xl ${bg} mb-4`}>
                          <Icon className={`h-8 w-8 ${color}`} />
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight">
                          {service.title}
                        </h2>
                        {service.short_description && (
                          <p className="mt-2 text-lg text-muted-foreground">
                            {service.short_description}
                          </p>
                        )}
                        {service.long_description && (
                          <p className="mt-4 text-muted-foreground whitespace-pre-line">
                            {service.long_description}
                          </p>
                        )}
                        {service.features && service.features.length > 0 && (
                          <ul className="mt-6 space-y-3">
                            {service.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2">
                                <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                        <Button asChild className="mt-6">
                          <Link href="/contact">
                            Get Started
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                      <div className={index % 2 === 1 ? "lg:col-start-1" : ""}>
                        <Card className="overflow-hidden">
                          <div className={`h-64 ${bg} flex items-center justify-center`}>
                            <Icon className={`h-24 w-24 ${color} opacity-50`} />
                          </div>
                        </Card>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
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

      <SiteFooter />
    </div>
  )
}
