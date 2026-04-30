"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import type { SiteSettings } from "@/types/settings"
import { saveSiteSettingsAction } from "./actions"

interface SettingsFormProps {
  settings: SiteSettings | null
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [logoUrl, setLogoUrl] = useState(settings?.logo_url || "")

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("logo_url", logoUrl)

    startTransition(async () => {
      const result = await saveSiteSettingsAction(settings?.id || null, formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      {/* Branding */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Branding</CardTitle>
          <CardDescription>
            Site name, tagline, and logo. Shown in the header and across the site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="site_name">
              Site name <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="site_name"
              name="site_name"
              required
              defaultValue={settings?.site_name || ""}
              placeholder="Kennedy Austin Foundation"
            />
          </div>
          <div>
            <Label htmlFor="site_tagline">Tagline</Label>
            <Input
              id="site_tagline"
              name="site_tagline"
              defaultValue={settings?.site_tagline || ""}
              placeholder="Crisis Intervention & Family Support"
            />
          </div>
          <div>
            <Label>Logo</Label>
            <FileUpload
              value={logoUrl}
              onChange={setLogoUrl}
              folder="logos"
              accept="image"
              previewClassName="h-24"
              placeholder="https://… or upload your logo"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              PNG/SVG with transparent background works best. Leave blank to use the
              default heart icon.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Contact</CardTitle>
          <CardDescription>
            Phone numbers, email, and address shown in the header banner, footer, and
            contact pages.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="primary_phone">Primary phone</Label>
              <Input
                id="primary_phone"
                name="primary_phone"
                type="tel"
                defaultValue={settings?.primary_phone || ""}
                placeholder="909-808-6866"
              />
            </div>
            <div>
              <Label htmlFor="crisis_line">Crisis lifeline</Label>
              <Input
                id="crisis_line"
                name="crisis_line"
                defaultValue={settings?.crisis_line || ""}
                placeholder="988"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="primary_email">Email</Label>
            <Input
              id="primary_email"
              name="primary_email"
              type="email"
              defaultValue={settings?.primary_email || ""}
              placeholder="admin@kennedyaustinfoundation.com"
            />
          </div>
          <div>
            <Label htmlFor="address">Address / location</Label>
            <Input
              id="address"
              name="address"
              defaultValue={settings?.address || ""}
              placeholder="Pomona, CA"
            />
          </div>
        </CardContent>
      </Card>

      {/* Foundation info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Foundation</CardTitle>
          <CardDescription>
            Used in the About page sections and the footer.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="founded_year">Founded year</Label>
              <Input
                id="founded_year"
                name="founded_year"
                type="number"
                min={1900}
                max={2100}
                defaultValue={settings?.founded_year ?? ""}
                placeholder="1993"
              />
            </div>
            <div>
              <Label htmlFor="founder_name">Founder name</Label>
              <Input
                id="founder_name"
                name="founder_name"
                defaultValue={settings?.founder_name || ""}
                placeholder="Ms. Ethel Gardner"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="footer_about">Footer about text</Label>
            <Textarea
              id="footer_about"
              name="footer_about"
              rows={3}
              defaultValue={settings?.footer_about || ""}
              placeholder="Supporting youth and families..."
            />
          </div>
          <div>
            <Label htmlFor="newsletter_blurb">Newsletter blurb</Label>
            <Textarea
              id="newsletter_blurb"
              name="newsletter_blurb"
              rows={2}
              defaultValue={settings?.newsletter_blurb || ""}
              placeholder="Subscribe to our newsletter for updates..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Social */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Social Media</CardTitle>
          <CardDescription>
            Links shown in the footer. Leave blank to hide an icon.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="facebook_url">Facebook URL</Label>
              <Input
                id="facebook_url"
                name="facebook_url"
                type="url"
                defaultValue={settings?.facebook_url || ""}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <Label htmlFor="instagram_url">Instagram URL</Label>
              <Input
                id="instagram_url"
                name="instagram_url"
                type="url"
                defaultValue={settings?.instagram_url || ""}
                placeholder="https://instagram.com/yourhandle"
              />
            </div>
            <div>
              <Label htmlFor="twitter_url">Twitter / X URL</Label>
              <Input
                id="twitter_url"
                name="twitter_url"
                type="url"
                defaultValue={settings?.twitter_url || ""}
                placeholder="https://twitter.com/yourhandle"
              />
            </div>
            <div>
              <Label htmlFor="youtube_url">YouTube URL</Label>
              <Input
                id="youtube_url"
                name="youtube_url"
                type="url"
                defaultValue={settings?.youtube_url || ""}
                placeholder="https://youtube.com/@yourchannel"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Legal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Legal / Footer</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="copyright_text">Copyright text</Label>
            <Input
              id="copyright_text"
              name="copyright_text"
              defaultValue={settings?.copyright_text || ""}
              placeholder="Auto-generated if blank: © 2026 Kennedy Austin Foundation. All rights reserved."
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Leave blank to auto-generate from site name and current year.
            </p>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Settings saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  )
}
