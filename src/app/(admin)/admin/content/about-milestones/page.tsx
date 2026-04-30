import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, Calendar } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getAllMilestones } from "@/lib/queries/cms"
import { MilestoneRow } from "./milestone-row"
import { MilestoneForm } from "./milestone-form"

export const metadata: Metadata = {
  title: "About / Milestones | Admin",
}

export default async function AdminMilestonesPage() {
  const { milestones, tableMissing } = await getAllMilestones()

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
        <h1 className="text-3xl font-bold tracking-tight">About — Milestones</h1>
        <p className="text-muted-foreground">
          Timeline entries shown on{" "}
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

      {milestones.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {milestones.map((m) => (
            <MilestoneRow key={m.id} milestone={m} />
          ))}
        </div>
      )}

      {milestones.length === 0 && !tableMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No milestones yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new milestone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MilestoneForm />
        </CardContent>
      </Card>
    </div>
  )
}
