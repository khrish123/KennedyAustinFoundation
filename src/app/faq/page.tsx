import { Metadata } from "next"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { getPublishedFaqs } from "@/lib/queries/faqs"

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers to common questions about classes, donations, and services at the Kennedy Austin Foundation.",
}

export default async function FaqPage() {
  const faqs = await getPublishedFaqs()

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h1>
          <p className="text-lg text-slate-600">
            Quick answers to questions we hear most often. Don&apos;t see yours? Reach out — we&apos;re happy to help.
          </p>
        </div>

        <div className="divide-y divide-slate-200 border-y border-slate-200 mb-10">
          {faqs.map((faq) => (
            <details key={faq.id} className="group py-4">
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold text-slate-900 list-none">
                <span>{faq.question}</span>
                <ChevronDown className="h-5 w-5 text-slate-500 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-slate-700 whitespace-pre-line">{faq.answer}</p>
            </details>
          ))}
        </div>

        <div className="rounded-lg bg-teal-50 border border-teal-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Still have questions?</h2>
          <p className="text-slate-700 mb-4">
            We respond to most messages within one business day.
          </p>
          <Button asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
