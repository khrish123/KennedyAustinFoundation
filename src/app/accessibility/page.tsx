import { Metadata } from "next"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Our commitment to making the Kennedy Austin Foundation website accessible to everyone.",
}

export default function AccessibilityPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Accessibility Statement</h1>
        <p className="text-sm text-slate-600 mb-8">Last updated: {new Date().getFullYear()}</p>

        <div className="prose prose-slate max-w-none space-y-6 text-slate-700">
          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Our Commitment</h2>
            <p>
              The Kennedy Austin Foundation is committed to making our website usable by everyone,
              including people who use assistive technologies. We strive to meet{" "}
              <a
                href="https://www.w3.org/WAI/standards-guidelines/wcag/"
                className="text-teal-700 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                WCAG 2.1 Level AA
              </a>{" "}
              standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">What We've Done</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Semantic HTML and ARIA labels for screen readers.</li>
              <li>Keyboard navigation for all interactive elements.</li>
              <li>Sufficient color contrast for text and UI components.</li>
              <li>Captions and transcripts for video content (in progress for older content).</li>
              <li>Resizable text without breaking layout.</li>
              <li>Multiple language options for key content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Where We're Improving</h2>
            <p>
              Accessibility is ongoing work. We're actively improving captions on legacy video content,
              alt text on older images, and PDF accessibility for downloadable resources.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-slate-900 mb-3">Need Help?</h2>
            <p>
              If you encounter an accessibility barrier or need information in an alternative format,
              please contact us so we can help and so we can fix it:
            </p>
            <ul className="list-none pl-0 space-y-1 mt-3">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href="mailto:admin@kennedyaustinfoundation.com"
                  className="text-teal-700 underline"
                >
                  admin@kennedyaustinfoundation.com
                </a>
              </li>
              <li>
                <strong>Phone:</strong>{" "}
                <a href="tel:909-808-6866" className="text-teal-700 underline">
                  909-808-6866
                </a>
              </li>
            </ul>
            <p className="mt-3">We aim to respond to accessibility requests within two business days.</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
