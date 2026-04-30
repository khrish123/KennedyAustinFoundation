import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, HelpCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllFaqs } from "@/lib/queries/faqs"
import { FaqRow } from "./faq-row"
import { FaqForm } from "./faq-form"

export const metadata: Metadata = {
  title: "FAQs | Admin",
}

export default async function AdminFaqsPage() {
  const { faqs, tableMissing } = await getAllFaqs()
  const publishedCount = faqs.filter((f) => f.is_published).length

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
        <h1 className="text-3xl font-bold tracking-tight">FAQs</h1>
        <p className="text-muted-foreground">
          Frequently asked questions shown on{" "}
          <Link href="/faq" className="text-teal-700 hover:underline">
            /faq
          </Link>
          . Lower order numbers appear first.
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
                supabase/migrations/005_faqs.sql
              </code>{" "}
              in the Supabase SQL editor.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {faqs.length > 0 && (
        <>
          <p className="text-xs text-muted-foreground">
            {publishedCount} published · {faqs.length - publishedCount} hidden
          </p>
          <div className="grid gap-3">
            {faqs.map((faq) => (
              <FaqRow key={faq.id} faq={faq} />
            ))}
          </div>
        </>
      )}

      {faqs.length === 0 && !tableMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <HelpCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No FAQs yet.</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Plus className="h-5 w-5" />
            Add new FAQ
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FaqForm />
        </CardContent>
      </Card>
    </div>
  )
}
