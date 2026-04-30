import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getEmailSettingsForAdmin } from "@/lib/queries/email-settings"
import { EmailForm } from "./email-form"

export const metadata: Metadata = {
  title: "Email Settings | Admin",
}

export default async function AdminEmailSettingsPage() {
  const { settings, tableMissing } = await getEmailSettingsForAdmin()

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          Site Settings
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Email Settings</h1>
        <p className="text-muted-foreground">
          Configure your SMTP server to send transactional emails (contact-form
          confirmations, support replies, etc.). Settings here are admin-only and
          encrypted at rest is recommended for production.
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
                supabase/migrations/009_email_settings.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!tableMissing && <EmailForm settings={settings} />}
    </div>
  )
}
