import { ArrowRight, Building2, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EcmProvider } from "@/types/ecm"

interface EcmProvidersSectionProps {
  providers: EcmProvider[]
}

export function EcmProvidersSection({ providers }: EcmProvidersSectionProps) {
  if (providers.length === 0) return null

  return (
    <section id="providers" className="py-16 bg-slate-50 border-y border-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge className="mb-3 bg-teal-100 text-teal-800 border-teal-200">
            Our Partners
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Health Plan Partners
          </h2>
          <p className="mt-3 text-slate-600 max-w-2xl mx-auto">
            We are a contracted ECM provider for the following Managed Care Plans.
            Click your plan to learn more or start a referral.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <Card
              key={p.id}
              className="overflow-hidden hover:shadow-warm-lg transition-all duration-300 hover-lift border border-slate-200 bg-white flex flex-col"
            >
              <div className="h-32 bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-6 border-b">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.logo_url}
                    alt={`${p.name} logo`}
                    className="max-h-20 max-w-full object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="h-8 w-8 text-teal-600" />
                    <span className="text-xl font-bold">{p.name}</span>
                  </div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="text-lg text-slate-900">{p.name}</CardTitle>
                {p.description && (
                  <CardDescription className="text-slate-600">
                    {p.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="mt-auto space-y-3">
                {p.populations_served && (
                  <p className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-700">Serves: </span>
                    {p.populations_served}
                  </p>
                )}
                {p.phone && (
                  <a
                    href={`tel:${p.phone.replace(/[^0-9+]/g, "")}`}
                    className="flex items-center gap-2 text-sm text-teal-700 hover:underline"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {p.phone}
                  </a>
                )}
                {p.website_url && (
                  <Button asChild className="w-full">
                    <a
                      href={p.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit {p.name}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
