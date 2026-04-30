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
import { getIcon } from "@/lib/icon-registry"
import type { AboutValue } from "@/types/cms"
import { ValueForm } from "./value-form"
import { toggleValueAction, deleteValueAction } from "./actions"

interface ValueRowProps {
  value: AboutValue
}

export function ValueRow({ value }: ValueRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()
  const Icon = getIcon(value.icon_name)

  const handleToggle = () => {
    startTransition(async () => {
      await toggleValueAction(value.id, value.is_published)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${value.title}"?`)) return
    startTransition(async () => {
      await deleteValueAction(value.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
            <Icon className="h-5 w-5 text-teal-700" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{value.title}</h3>
              <Badge variant="outline" className="text-xs">
                #{value.order_index}
              </Badge>
              {value.is_published ? (
                <Badge className="bg-emerald-500 text-xs">Published</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {value.description}
            </p>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
            {value.is_published ? (
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
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit value</DialogTitle>
          </DialogHeader>
          <ValueForm value={value} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
