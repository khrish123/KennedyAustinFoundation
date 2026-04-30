import { Metadata } from "next"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the Kennedy Austin Foundation collects, uses, and protects your information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-600 mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Commitment</h2>
            <p>
              The Kennedy Austin Foundation is committed to protecting the privacy of every person who
              uses our services. The information you share with us — especially during moments of grief
              or crisis — is treated with the utmost care and confidentiality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account information:</strong> name, email address, and password when you register.</li>
              <li><strong>Profile details:</strong> phone, language preference, notification settings.</li>
              <li><strong>Activity data:</strong> classes you enroll in, lesson progress, journal entries, and forum posts.</li>
              <li><strong>Donations:</strong> billing information processed securely by Stripe; we never see your full card number.</li>
              <li><strong>Technical data:</strong> standard server logs (IP address, browser, pages visited).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">How We Use It</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To deliver classes, track your progress, and personalize your experience.</li>
              <li>To send service emails, class reminders, and (with your opt-in) newsletters.</li>
              <li>To process donations and provide tax receipts.</li>
              <li>To improve the platform and respond to support requests.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Journal Privacy</h2>
            <p>
              Journal entries marked private are visible only to you. We do not read, analyze, or share
              private journal content. Staff can access entries only when legally required (e.g. a court
              order) or in an active crisis situation.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Sharing</h2>
            <p>
              We do not sell your personal information. We share data only with vendors who help us run
              the platform (e.g. Supabase for database, Stripe for payments, Resend for email, Mux for
              video) under strict confidentiality agreements.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Your Rights</h2>
            <p>
              You can update or delete your account at any time from your{" "}
              <a href="/settings" className="text-teal-700 underline">settings page</a>. To request a copy of
              your data or full account deletion, email{" "}
              <a href="mailto:admin@kennedyaustinfoundation.com" className="text-teal-700 underline">
                admin@kennedyaustinfoundation.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Contact</h2>
            <p>
              Questions about this policy? Reach us at{" "}
              <a href="mailto:admin@kennedyaustinfoundation.com" className="text-teal-700 underline">
                admin@kennedyaustinfoundation.com
              </a>{" "}
              or call <a href="tel:909-808-6866" className="text-teal-700 underline">909-808-6866</a>.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
