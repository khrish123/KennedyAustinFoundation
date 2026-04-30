"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  toggleServicePublishedAction,
  deleteServiceAction,
} from "./actions"

interface ServiceRowActionsProps {
  id: string
  title: string
  isPublished: boolean
}

export function ServiceRowActions({
  id,
  title,
  isPublished,
}: ServiceRowActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleServicePublishedAction(id, isPublished)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete service "${title}"?`)) return
    startTransition(async () => {
      await deleteServiceAction(id)
      router.refresh()
    })
  }

  return (
    <div className="flex items-center gap-1">
      <Badge
        className={
          isPublished
            ? "bg-emerald-500 text-xs"
            : "bg-slate-200 text-slate-700 text-xs"
        }
      >
        {isPublished ? "Published" : "Draft"}
      </Badge>
      <Button asChild size="sm" variant="ghost" disabled={pending}>
        <Link href={`/admin/content/services/${id}/edit`}>
          <Pencil className="h-3.5 w-3.5 mr-1" />
          Edit
        </Link>
      </Button>
      <Button size="sm" variant="ghost" onClick={handleToggle} disabled={pending}>
        {isPublished ? (
          <EyeOff className="h-3.5 w-3.5" />
        ) : (
          <Eye className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={handleDelete}
        disabled={pending}
        className="text-rose-700 hover:text-rose-800 hover:bg-rose-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  )
}
