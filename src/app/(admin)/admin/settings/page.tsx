import { Metadata } from "next"
import Link from "next/link"
import { Mail, ArrowRight } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getSiteSettingsForAdmin } from "@/lib/queries/settings"
import { SettingsForm } from "./settings-form"

export const metadata: Metadata = {
  title: "Site Settings | Admin",
}

export default async function AdminSettingsPage() {
  const { settings, tableMissing } = await getSiteSettingsForAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-muted-foreground">
          Branding, contact info, social links, and footer content. Changes appear on
          the public site immediately.
        </p>
      </div>

      <Link href="/admin/settings/email" className="block">
        <Card className="hover:border-teal-300 transition">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
                  <Mail className="h-5 w-5 text-teal-700" />
                </div>
                <div>
                  <CardTitle className="text-lg">Email Settings</CardTitle>
                  <CardDescription>
                    Configure SMTP (GoDaddy / Gmail / Zoho / etc.) so the site can
                    send confirmations, replies, and notifications.
                  </CardDescription>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground mt-1" />
            </div>
          </CardHeader>
        </Card>
      </Link>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              The <code className="px-1 rounded bg-amber-100">site_settings</code>{" "}
              table hasn&apos;t been created yet. Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/004_site_settings.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh this page.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!tableMissing && <SettingsForm settings={settings} />}
    </div>
  )
}
