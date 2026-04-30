"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Pencil, Trash2, Building2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { EcmProvider } from "@/types/ecm"
import { ProviderForm } from "./provider-form"
import {
  toggleProviderVisibilityAction,
  deleteProviderAction,
} from "./actions"

interface ProviderCardProps {
  provider: EcmProvider
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const handleToggle = () => {
    startTransition(async () => {
      await toggleProviderVisibilityAction(provider.id, provider.is_visible)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (
      !confirm(`Delete provider "${provider.name}"? This cannot be undone.`)
    )
      return
    startTransition(async () => {
      await deleteProviderAction(provider.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background overflow-hidden flex flex-col">
        <div className="relative h-32 bg-gradient-to-br from-teal-50 via-white to-amber-50 flex items-center justify-center p-4 border-b">
          {provider.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={provider.logo_url}
              alt={`${provider.name} logo`}
              className="max-h-20 max-w-full object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 text-slate-700">
              <Building2 className="h-7 w-7 text-teal-600" />
              <span className="text-lg font-bold">{provider.name}</span>
            </div>
          )}
          {!provider.is_visible && (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
              <Badge variant="secondary">Hidden</Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3 flex-1">
          <div>
            <h3 className="font-semibold text-slate-900">{provider.name}</h3>
            {provider.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {provider.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              Order: {provider.order_index}
            </Badge>
            {provider.is_visible ? (
              <Badge
                variant="outline"
                className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                Visible
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs">
                Hidden
              </Badge>
            )}
            {provider.website_url && (
              <a
                href={provider.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-teal-700 hover:underline"
              >
                <ExternalLink className="h-3 w-3" />
                Site
              </a>
            )}
          </div>
        </div>

        <div className="flex gap-2 p-3 border-t bg-muted/30">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            disabled={pending}
          >
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleToggle}
            disabled={pending}
          >
            {provider.is_visible ? (
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
            <DialogTitle>Edit provider</DialogTitle>
          </DialogHeader>
          <ProviderForm provider={provider} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
