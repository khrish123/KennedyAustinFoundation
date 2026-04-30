"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ICON_NAMES, getIcon } from "@/lib/icon-registry"

interface IconPickerProps {
  value: string
  onChange: (next: string) => void
  placeholder?: string
}

/**
 * Dropdown for picking from the curated icon registry. Shows the icon
 * preview next to each option name so admins can pick visually.
 */
export function IconPicker({
  value,
  onChange,
  placeholder = "Pick an icon",
}: IconPickerProps) {
  const Current = value ? getIcon(value) : null

  return (
    <div className="flex items-center gap-2">
      {Current && (
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-teal-50">
          <Current className="h-5 w-5 text-teal-700" />
        </div>
      )}
      <Select value={value || "__none__"} onValueChange={(v) => onChange(v === "__none__" ? "" : v)}>
        <SelectTrigger className="flex-1">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none__">None</SelectItem>
          {ICON_NAMES.map((name) => {
            const Icon = getIcon(name)
            return (
              <SelectItem key={name} value={name}>
                <span className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  {name}
                </span>
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
}
