"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { setStatusAction } from "./actions"

interface StatusControlProps {
  requestId: string
  status: string
}

export function StatusControl({ requestId, status }: StatusControlProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const handleChange = (next: string) => {
    if (next === status) return
    startTransition(async () => {
      await setStatusAction(requestId, next)
      router.refresh()
    })
  }

  return (
    <Select value={status} onValueChange={handleChange} disabled={pending}>
      <SelectTrigger className="w-[160px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="new">New</SelectItem>
        <SelectItem value="in_progress">In progress</SelectItem>
        <SelectItem value="resolved">Resolved</SelectItem>
      </SelectContent>
    </Select>
  )
}
