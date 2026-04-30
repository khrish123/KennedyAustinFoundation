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
import type { AboutMilestone } from "@/types/cms"
import { MilestoneForm } from "./milestone-form"
import { toggleMilestoneAction, deleteMilestoneAction } from "./actions"

interface MilestoneRowProps {
  milestone: AboutMilestone
}

export function MilestoneRow({ milestone }: MilestoneRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleMilestoneAction(milestone.id, milestone.is_published)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${milestone.year} — ${milestone.title}"?`)) return
    startTransition(async () => {
      await deleteMilestoneAction(milestone.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="flex flex-col items-center justify-center rounded-lg bg-teal-50 px-3 py-1 min-w-[80px] flex-shrink-0">
            <span className="text-xs font-bold text-teal-700">YEAR</span>
            <span className="text-lg font-bold text-slate-900 leading-none">
              {milestone.year}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
              <Badge variant="outline" className="text-xs">
                #{milestone.order_index}
              </Badge>
              {milestone.is_published ? (
                <Badge className="bg-emerald-500 text-xs">Published</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">
                  Hidden
                </Badge>
              )}
            </div>
            {milestone.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {milestone.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
            {milestone.is_published ? (
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
            <DialogTitle>Edit milestone</DialogTitle>
          </DialogHeader>
          <MilestoneForm milestone={milestone} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
