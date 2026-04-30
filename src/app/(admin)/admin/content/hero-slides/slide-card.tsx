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
import type { HeroSlide } from "@/types/hero"
import { SlideForm } from "./slide-form"
import { toggleSlideAction, deleteSlideAction } from "./actions"

interface SlideCardProps {
  slide: HeroSlide
}

export function SlideCard({ slide }: SlideCardProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const hasMedia = !!(slide.background_video_url || slide.background_image_url)
  const hasCta = !!(slide.primary_cta_text || slide.secondary_cta_text)

  const handleToggle = () => {
    startTransition(async () => {
      await toggleSlideAction(slide.id, slide.is_active)
      router.refresh()
    })
  }

  const handleDelete = () => {
    if (!confirm(`Delete slide "${slide.title}"? This cannot be undone.`)) return
    startTransition(async () => {
      await deleteSlideAction(slide.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="rounded-lg border bg-background overflow-hidden">
        <div className="relative h-40 w-full bg-gradient-to-br from-teal-100 via-amber-100 to-rose-100">
          {slide.background_video_url ? (
            <video
              src={slide.background_video_url}
              poster={slide.background_image_url || undefined}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : slide.background_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.background_image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : null}
          {!slide.is_active && (
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
              <Badge variant="secondary">Hidden</Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">
              {slide.title}
            </h3>
            {slide.subtitle && (
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {slide.subtitle}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="outline" className="text-xs">
              Order: {slide.order_index}
            </Badge>
            {hasCta && (
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                Has CTA
              </Badge>
            )}
            {slide.background_video_url && (
              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                Video
              </Badge>
            )}
            {!hasMedia && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                No media
              </Badge>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t">
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
              {slide.is_active ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Disable
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Enable
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
      </div>

      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit slide</DialogTitle>
          </DialogHeader>
          <SlideForm slide={slide} onDone={() => setEditing(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
