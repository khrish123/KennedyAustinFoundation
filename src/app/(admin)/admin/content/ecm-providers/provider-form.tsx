"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/admin/file-upload"
import type { EcmProvider } from "@/types/ecm"
import { createProviderAction, updateProviderAction } from "./actions"

interface ProviderFormProps {
  provider?: EcmProvider
  onDone?: () => void
}

export function ProviderForm({ provider, onDone }: ProviderFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [visible, setVisible] = useState(provider?.is_visible ?? false)
  const [logoUrl, setLogoUrl] = useState(provider?.logo_url || "")

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("is_visible", visible ? "true" : "false")
    formData.set("logo_url", logoUrl)

    startTransition(async () => {
      const result = provider
        ? await updateProviderAction(provider.id, formData)
        : await createProviderAction(formData)

      if (result?.error) {
        setError(result.error)
        return
      }
      onDone?.()
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">
          Name <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={provider?.name || ""}
          placeholder="L.A. Care Health Plan"
        />
      </div>

      <div>
        <Label htmlFor="description">Short description</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={provider?.description || ""}
          placeholder="Medi-Cal Managed Care Plan serving LA County."
        />
      </div>

      <div>
        <Label>Logo</Label>
        <FileUpload
          value={logoUrl}
          onChange={setLogoUrl}
          folder="provider-logos"
          accept="image"
          previewClassName="h-24"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          PNG/SVG with transparent background works best.
        </p>
      </div>

      <div>
        <Label htmlFor="website_url">Website / portal URL</Label>
        <Input
          id="website_url"
          name="website_url"
          type="url"
          defaultValue={provider?.website_url || ""}
          placeholder="https://lacare.org/providers/ecm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Member phone</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            defaultValue={provider?.phone || ""}
            placeholder="1-888-839-9909"
          />
        </div>
        <div>
          <Label htmlFor="slug">URL slug</Label>
          <Input
            id="slug"
            name="slug"
            defaultValue={provider?.slug || ""}
            placeholder="auto-generated from name"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Optional. Used if we add per-provider sub-pages later.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="populations_served">Populations served</Label>
        <Input
          id="populations_served"
          name="populations_served"
          defaultValue={provider?.populations_served || ""}
          placeholder="Adults, Child & Youth, Justice-Involved"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Comma-separated list shown on the card.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="order_index">Display order</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            defaultValue={provider?.order_index ?? 0}
            min={0}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers appear first.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <Label className="mb-2">Show on public site</Label>
          <div className="flex items-center gap-2">
            <Switch checked={visible} onCheckedChange={setVisible} />
            <span className="text-sm text-muted-foreground">
              {visible
                ? "Visible on /ecm"
                : "Hidden — admins only"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : provider ? "Save changes" : "Add provider"}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
