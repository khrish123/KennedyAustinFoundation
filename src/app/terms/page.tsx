import { Metadata } from "next"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions for using the Kennedy Austin Foundation website and services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-slate-600 mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section className="bg-rose-50 border border-rose-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-rose-900 mb-2">Not a Substitute for Emergency Care</h2>
            <p className="text-sm text-rose-900">
              If you are in crisis or having thoughts of suicide, call <strong>988</strong> or{" "}
              <strong>911</strong> immediately. Our services are supportive in nature and do not replace
              professional medical, psychiatric, or emergency care.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Acceptance of Terms</h2>
            <p>
              By creating an account or using kennedyaustinfoundation.com, you agree to these terms.
              If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Eligibility</h2>
            <p>
              You must be at least 13 years old to create an account. If you are under 18, you must have
              a parent or guardian's permission to participate in classes or community features.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Your Account</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are responsible for keeping your password secure.</li>
              <li>You agree to provide accurate registration information.</li>
              <li>One account per person; do not share login credentials.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Community Guidelines</h2>
            <p>When posting in forums, comments, or any community space, you agree to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Treat others with respect, especially those sharing painful experiences.</li>
              <li>Not post abusive, threatening, hateful, or discriminatory content.</li>
              <li>Not give medical, legal, or psychiatric advice you aren't qualified to give.</li>
              <li>Not share other members' personal stories without permission.</li>
            </ul>
            <p className="mt-3">
              We may remove content or suspend accounts that violate these guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Donations</h2>
            <p>
              Donations are processed by Stripe and, unless otherwise specified, are non-refundable.
              The Kennedy Austin Foundation is a registered nonprofit; consult your tax advisor for
              deductibility in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Class Content</h2>
            <p>
              Recorded classes, written materials, and other content on this site are licensed for your
              personal use. Do not copy, redistribute, or sell our materials without written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Termination</h2>
            <p>
              You may close your account at any time from settings. We may suspend or terminate accounts
              that violate these terms or pose a risk to other members.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Disclaimers</h2>
            <p>
              The service is provided "as is" without warranty. The Kennedy Austin Foundation is not
              liable for indirect or consequential damages arising from use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Contact</h2>
            <p>
              Questions? Email{" "}
              <a href="mailto:admin@kennedyaustinfoundation.com" className="text-teal-700 underline">
                admin@kennedyaustinfoundation.com
              </a>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
