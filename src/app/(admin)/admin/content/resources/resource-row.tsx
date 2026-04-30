"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Trash2, ExternalLink, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Resource } from "@/types/resource"
import { ResourceForm } from "./resource-form"
import { toggleResourceAction, deleteResourceAction } from "./actions"

interface ResourceRowProps {
  resource: Resource
}

export function ResourceRow({ resource }: ResourceRowProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleResourceAction(resource.id, resource.is_published)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${resource.title}"?`)) return
    startTransition(async () => {
      await deleteResourceAction(resource.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background p-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-slate-900">{resource.title}</h3>
              {resource.is_crisis_resource && (
                <Badge className="bg-rose-500 text-xs">Crisis</Badge>
              )}
              {resource.is_published ? (
                <Badge className="bg-emerald-500 text-xs">Published</Badge>
              ) : (
                <Badge variant="secondary" className="text-xs">Hidden</Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {resource.category}
              </Badge>
              <Badge variant="outline" className="text-xs uppercase">
                {resource.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                #{resource.order_index}
              </Badge>
            </div>
            {resource.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {resource.description}
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {resource.phone && (
                <span className="inline-flex items-center gap-1 text-xs text-slate-600">
                  <Phone className="h-3 w-3" />
                  {resource.phone}
                </span>
              )}
              {resource.url && (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Link
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)} disabled={pending}>
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
            {resource.is_published ? (
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
            <DialogTitle>Edit resource</DialogTitle>
          </DialogHeader>
          <ResourceForm resource={resource} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
