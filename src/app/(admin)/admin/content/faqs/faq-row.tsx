"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Faq } from "@/types/faq"
import { FaqForm } from "./faq-form"
import { toggleFaqAction, deleteFaqAction } from "./actions"

interface FaqRowProps {
  faq: Faq
}

export function FaqRow({ faq }: FaqRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleFaqAction(faq.id, faq.is_published)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete FAQ "${faq.question}"?`)) return
    startTransition(async () => {
      await deleteFaqAction(faq.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{faq.question}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1 whitespace-pre-line">
              {faq.answer}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge variant="outline" className="text-xs">
              #{faq.order_index}
            </Badge>
            {faq.is_published ? (
              <Badge className="bg-emerald-500 text-xs">Published</Badge>
            ) : (
              <Badge variant="secondary" className="text-xs">Hidden</Badge>
            )}
          </div>
        </div>
        {faq.category && (
          <Badge variant="outline" className="text-xs mb-2">
            {faq.category}
          </Badge>
        )}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
            {faq.is_published ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Hide
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Show
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            disabled={pending}
            className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 ml-auto"
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" />
            Delete
          </Button>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
          </DialogHeader>
          <FaqForm faq={faq} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
