import { Metadata } from "next"
import Link from "next/link"
import { Phone, Mail, MapPin, Clock, AlertCircle } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ContactForm } from "./contact-form"

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Reach the Kennedy Austin Foundation by phone, email, or message form. We respond within one business day.",
}

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["Crisis Line: 909-808-6866", "Office: 909-808-6866"],
    action: { label: "Call Now", href: "tel:909-808-6866" },
  },
  {
    icon: Mail,
    title: "Email",
    details: ["admin@kennedyaustinfoundation.com"],
    action: {
      label: "Send Email",
      href: "mailto:admin@kennedyaustinfoundation.com",
    },
  },
  {
    icon: MapPin,
    title: "Location",
    details: ["Serving Pomona, Claremont,", "and La Verne, California"],
    action: null,
  },
  {
    icon: Clock,
    title: "Hours",
    details: ["Crisis Support: 24/7", "Office: Mon-Fri, 9am-5pm"],
    action: null,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1">
        <div className="bg-destructive text-destructive-foreground py-3">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>
              <strong>In immediate danger?</strong> Call 911. For crisis support,
              call{" "}
              <a href="tel:909-808-6866" className="underline font-bold">
                909-808-6866
              </a>
            </span>
          </div>
        </div>

        <section className="relative bg-gradient-to-b from-primary/5 to-background py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <Badge className="mb-4">Contact Us</Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                We&apos;re Here to Help
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Whether you need support, have questions about our services, or
                want to get involved, we&apos;d love to hear from you. Reach out
                today.
              </p>
            </div>
          </div>
        </section>

        <section className="py-12 bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((item) => (
                <Card key={item.title}>
                  <CardHeader className="pb-2">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {item.details.map((detail, index) => (
                      <p key={index} className="text-sm text-muted-foreground">
                        {detail}
                      </p>
                    ))}
                    {item.action && (
                      <Button asChild variant="link" className="px-0 mt-2">
                        <a href={item.action.href}>{item.action.label}</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  Send Us a Message
                </h2>
                <p className="mt-4 text-muted-foreground">
                  Fill out the form below and we&apos;ll get back to you as soon
                  as possible. For urgent matters, please call our crisis line
                  directly.
                </p>
                <ContactForm />
              </div>

              <div className="lg:pl-8">
                <Card className="bg-muted/50">
                  <CardHeader>
                    <CardTitle>Other Ways to Connect</CardTitle>
                    <CardDescription>
                      Choose the option that works best for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h4 className="font-semibold mb-2">Crisis Support</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        If you&apos;re in crisis or need immediate support, please
                        don&apos;t wait. Our crisis line is available 24/7.
                      </p>
                      <Button asChild variant="destructive">
                        <a href="tel:909-808-6866">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Crisis Line
                        </a>
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">AI Support Chat</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        Need guidance or resources? Our AI assistant is available
                        24/7 to help point you in the right direction.
                      </p>
                      <Button asChild variant="outline">
                        <Link href="/chat">Start Chat</Link>
                      </Button>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Visit Us</h4>
                      <p className="text-sm text-muted-foreground">
                        We serve the Tri-City area including Pomona, Claremont,
                        and La Verne, California. Contact us to schedule an
                        in-person appointment.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
