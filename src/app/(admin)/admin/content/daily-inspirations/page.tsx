import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Sparkles } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllInspirations } from "@/lib/queries/inspirations"
import { InspirationRow } from "./inspiration-row"
import { InspirationForm } from "./inspiration-form"

export const metadata: Metadata = {
  title: "Daily Inspirations | Admin",
}

export default async function AdminInspirationsPage() {
  const { inspirations, tableMissing } = await getAllInspirations()
  const activeCount = inspirations.filter((i) => i.is_active).length

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
        <h1 className="text-3xl font-bold tracking-tight">Daily Inspirations</h1>
        <p className="text-muted-foreground">
          Short uplifting quotes / messages. The site picks one at random for the
          dashboard and other inspiration spots.
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

      {inspirations.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {activeCount} active · {inspirations.length - activeCount} inactive
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {inspirations.map((i) => (
              <InspirationRow key={i.id} inspiration={i} />
            ))}
          </div>
        </>
      )}

      {inspirations.length === 0 && !tableMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Sparkles className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No inspirations yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new inspiration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InspirationForm />
        </CardContent>
      </Card>
    </div>
  )
}
