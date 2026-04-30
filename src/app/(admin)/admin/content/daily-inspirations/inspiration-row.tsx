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
import type { DailyInspiration } from "@/types"
import { InspirationForm } from "./inspiration-form"
import {
  toggleInspirationAction,
  deleteInspirationAction,
} from "./actions"

interface InspirationRowProps {
  inspiration: DailyInspiration
}

export function InspirationRow({ inspiration }: InspirationRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleInspirationAction(inspiration.id, inspiration.is_active)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete this inspiration?`)) return
    startTransition(async () => {
      await deleteInspirationAction(inspiration.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <p className="text-slate-800 italic mb-3 whitespace-pre-line">
          &ldquo;{inspiration.content}&rdquo;
        </p>
        <div className="flex flex-wrap gap-1.5 mb-3">
          {inspiration.is_active ? (
            <Badge className="bg-emerald-500 text-xs">Active</Badge>
          ) : (
            <Badge variant="secondary" className="text-xs">Inactive</Badge>
          )}
          {inspiration.category && (
            <Badge variant="outline" className="text-xs">
              {inspiration.category}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs uppercase">
            {inspiration.language}
          </Badge>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
            {inspiration.is_active ? (
              <>
                <EyeOff className="h-3.5 w-3.5 mr-1" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5 mr-1" />
                Activate
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
            <DialogTitle>Edit inspiration</DialogTitle>
          </DialogHeader>
          <InspirationForm
            inspiration={inspiration}
            onDone={() => setEditing(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
