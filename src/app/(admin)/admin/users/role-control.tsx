"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { changeUserRoleAction } from "./actions"

interface RoleControlProps {
  userId: string
  currentRole: string
  /** Whether this user is the currently-signed-in admin (locks them in to prevent self-demotion). */
  isSelf: boolean
  /** The viewer's role — gates whether they can grant super_admin. */
  viewerRole: string
}

export function RoleControl({
  userId,
  currentRole,
  isSelf,
  viewerRole,
}: RoleControlProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [value, setValue] = useState(currentRole)

  const canGrantSuperAdmin = viewerRole === "super_admin"
  const lockSelf = isSelf && currentRole === "super_admin"

  const handleChange = (next: string) => {
    if (next === value) return
    setError(null)
    const previous = value
    setValue(next)

    startTransition(async () => {
      const result = await changeUserRoleAction(userId, next)
      if (result?.error) {
        setError(result.error)
        setValue(previous) // revert on failure
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Select
        value={value}
        onValueChange={handleChange}
        disabled={pending || lockSelf}
      >
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">User</SelectItem>
          <SelectItem value="instructor">Instructor</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          {canGrantSuperAdmin && (
            <SelectItem value="super_admin">Super Admin</SelectItem>
          )}
        </SelectContent>
      </Select>
      {lockSelf && (
        <span className="text-[10px] text-muted-foreground">
          Locked: cannot self-demote
        </span>
      )}
      {error && (
        <span className="text-[10px] text-rose-700 max-w-[160px] text-right">
          {error}
        </span>
      )}
    </div>
  )
}
