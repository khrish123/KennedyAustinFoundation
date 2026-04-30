"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { Faq } from "@/types/faq"
import { createFaqAction, updateFaqAction } from "./actions"

interface FaqFormProps {
  faq?: Faq
  onDone?: () => void
}

export function FaqForm({ faq, onDone }: FaqFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [published, setPublished] = useState(faq?.is_published ?? true)

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = faq
        ? await updateFaqAction(faq.id, formData)
        : await createFaqAction(formData)

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
        <Label htmlFor="question">
          Question <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="question"
          name="question"
          required
          defaultValue={faq?.question || ""}
          placeholder="Are your classes really free?"
        />
      </div>

      <div>
        <Label htmlFor="answer">
          Answer <span className="text-rose-600">*</span>
        </Label>
        <Textarea
          id="answer"
          name="answer"
          required
          rows={5}
          defaultValue={faq?.answer || ""}
          placeholder="Most of our core classes are free…"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Line breaks are preserved on the public page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="category">Category (optional)</Label>
          <Input
            id="category"
            name="category"
            defaultValue={faq?.category || ""}
            placeholder="Classes, Donations, Privacy…"
          />
        </div>
        <div>
          <Label htmlFor="order_index">Display order</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            min={0}
            defaultValue={faq?.order_index ?? 0}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Switch checked={published} onCheckedChange={setPublished} />
        <span className="text-sm text-muted-foreground">
          {published ? "Visible on /faq" : "Hidden — admins only"}
        </span>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : faq ? "Save changes" : "Add FAQ"}
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
