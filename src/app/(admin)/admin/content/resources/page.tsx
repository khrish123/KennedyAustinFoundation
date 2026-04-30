import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, BookOpen } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllResources } from "@/lib/queries/resources"
import { ResourceRow } from "./resource-row"
import { ResourceForm } from "./resource-form"

export const metadata: Metadata = {
  title: "Resources | Admin",
}

export default async function AdminResourcesPage() {
  const { resources, tableMissing, needsMigration } = await getAllResources()

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
        <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">
          Crisis hotlines, articles, PDFs, and external links shown on{" "}
          <Link href="/resources" className="text-teal-700 hover:underline">
            /resources
          </Link>
          .
        </p>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/001_initial_schema.sql
              </code>{" "}
              first.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {needsMigration && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Resources table needs an update
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/006_resources_extend.sql
              </code>{" "}
              to add the new admin fields (phone, order, published toggle).
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {resources.length > 0 && (
        <div className="grid gap-3">
          {resources.map((r) => (
            <ResourceRow key={r.id} resource={r} />
          ))}
        </div>
      )}

      {resources.length === 0 && !tableMissing && !needsMigration && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No resources yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new resource
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResourceForm />
        </CardContent>
      </Card>
    </div>
  )
}
