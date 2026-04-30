import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Heart } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAllValues } from "@/lib/queries/cms"
import { ValueRow } from "./value-row"
import { ValueForm } from "./value-form"

export const metadata: Metadata = {
  title: "About / Values | Admin",
}

export default async function AdminValuesPage() {
  const { values, tableMissing } = await getAllValues()

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
        <h1 className="text-3xl font-bold tracking-tight">About — Values</h1>
        <p className="text-muted-foreground">
          Core values shown in the &quot;Our Mission&quot; section on{" "}
          <Link href="/about" className="text-teal-700 hover:underline">
            /about
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
                supabase/migrations/011_about_services_cms.sql
              </code>
              .
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {values.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {values.map((v) => (
            <ValueRow key={v.id} value={v} />
          ))}
        </div>
      )}

      {values.length === 0 && !tableMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Heart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No values yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ValueForm />
        </CardContent>
      </Card>
    </div>
  )
}
