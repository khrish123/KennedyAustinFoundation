"use client"

import { useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  EyeOff,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { togglePublishAction, deleteClassAction } from "./actions"

interface ClassRowActionsProps {
  id: string
  slug: string
  title: string
  isPublished: boolean
}

export function ClassRowActions({
  id,
  slug,
  title,
  isPublished,
}: ClassRowActionsProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await togglePublishAction(id, isPublished)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (
      !confirm(
        `Delete class "${title}"? This also removes any enrollments. Cannot be undone.`
      )
    )
      return
    startTransition(async () => {
      await deleteClassAction(id)
      router.refresh()
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" disabled={pending}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/classes/${slug}`} target="_blank">
            <Eye className="mr-2 h-4 w-4" />
            View public page
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/classes/${id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggle} disabled={pending}>
          {isPublished ? (
            <>
              <EyeOff className="mr-2 h-4 w-4" />
              Unpublish
            </>
          ) : (
            <>
              <Eye className="mr-2 h-4 w-4" />
              Publish
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={pending}
          className="text-rose-600 focus:text-rose-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
