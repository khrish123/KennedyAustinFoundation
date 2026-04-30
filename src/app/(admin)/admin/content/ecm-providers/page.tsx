import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Sparkles, EyeOff } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllEcmProviders } from "@/lib/queries/ecm"
import { ProviderCard } from "./provider-card"
import { ProviderForm } from "./provider-form"

export const metadata: Metadata = {
  title: "ECM Providers | Admin",
}

export default async function AdminEcmProvidersPage() {
  const { providers, tableMissing } = await getAllEcmProviders()
  const visibleCount = providers.filter((p) => p.is_visible).length
  const hiddenCount = providers.length - visibleCount

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/content"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Content
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">ECM Providers</h1>
        <p className="text-muted-foreground">
          Managed Care Plan partners shown on the{" "}
          <Link href="/ecm" className="text-teal-700 hover:underline">
            /ecm
          </Link>{" "}
          page. Toggle each provider&apos;s visibility to show or hide it on the public
          site.
        </p>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              The <code className="px-1 rounded bg-amber-100">ecm_providers</code>{" "}
              table hasn&apos;t been created yet. Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/003_ecm_providers.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="bg-teal-50/60 border-teal-200">
        <CardContent className="flex items-start gap-3 py-4">
          <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-teal-100">
            <Sparkles className="h-4 w-4 text-teal-700" />
          </div>
          <div className="text-sm text-teal-900">
            <strong>Tip:</strong> New providers are <strong>hidden by default</strong>.
            Fill in the details, then flip the &quot;Show on public site&quot; switch
            when you&apos;re ready to go live.
            {providers.length > 0 && (
              <span className="block mt-1 text-xs text-teal-800/80">
                {visibleCount} visible · {hiddenCount} hidden
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {providers.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {providers.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}

      {providers.length === 0 && !tableMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <EyeOff className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">
              No providers yet. Add your first Managed Care Plan partner below.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new provider
          </CardTitle>
          <CardDescription>
            Common partners: L.A. Care Health Plan, Molina Healthcare, Health Net,
            Blue Shield Promise, Anthem Blue Cross, Kaiser Permanente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProviderForm />
        </CardContent>
      </Card>
    </div>
  )
}
