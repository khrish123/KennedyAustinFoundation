"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { FileUpload } from "@/components/admin/file-upload"
import {
  HERO_BACKGROUND_PRESETS,
  HERO_IMAGE_POSITIONS,
  normalizeHexColor,
  type HeroImagePosition,
  type HeroSlide,
} from "@/types/hero"
import { createSlideAction, updateSlideAction } from "./actions"

interface SlideFormProps {
  slide?: HeroSlide
  onDone?: () => void
}

export function SlideForm({ slide, onDone }: SlideFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [active, setActive] = useState(slide?.is_active ?? true)
  const [imageUrl, setImageUrl] = useState(slide?.background_image_url || "")
  const [videoUrl, setVideoUrl] = useState(slide?.background_video_url || "")
  const [showWholeImage, setShowWholeImage] = useState(
    slide?.image_fit === "contain"
  )
  const [allowDownload, setAllowDownload] = useState(
    slide?.allow_download ?? false
  )
  const [imagePosition, setImagePosition] = useState<HeroImagePosition>(
    slide?.image_position || "right"
  )
  const [bgColor, setBgColor] = useState(
    normalizeHexColor(slide?.background_color) || ""
  )

  const handleSubmit = (formData: FormData) => {
    setError(null)
    formData.set("is_active", active ? "true" : "false")
    formData.set("background_image_url", imageUrl)
    formData.set("background_video_url", videoUrl)
    formData.set("image_fit", showWholeImage ? "contain" : "cover")
    formData.set("allow_download", allowDownload ? "true" : "false")
    formData.set("image_position", imagePosition)
    formData.set("background_color", bgColor)

    startTransition(async () => {
      const result = slide
        ? await updateSlideAction(slide.id, formData)
        : await createSlideAction(formData)

      if (result?.error) {
        setError(result.error)
        return
      }
      onDone?.()
      router.refresh()
    })
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">
          Title <span className="text-rose-600">*</span>
        </Label>
        <Input
          id="title"
          name="title"
          required
          defaultValue={slide?.title || ""}
          placeholder="You Are Not Alone. Hope Lives Here."
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Textarea
          id="subtitle"
          name="subtitle"
          rows={3}
          defaultValue={slide?.subtitle || ""}
          placeholder="Supporting text that appears below the title"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Background image</Label>
          <FileUpload
            value={imageUrl}
            onChange={setImageUrl}
            folder="hero-slides"
            accept="image"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            JPG/PNG/WebP. Also used as poster when video is set.
          </p>
        </div>
        <div>
          <Label>Background video</Label>
          <FileUpload
            value={videoUrl}
            onChange={setVideoUrl}
            folder="hero-slides"
            accept="video"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            MP4 / WebM, plays muted &amp; looped. Up to 50 MB.
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
        <div>
          <Label className="mb-2 block">Background color</Label>
          <div className="flex flex-wrap items-center gap-2">
            {HERO_BACKGROUND_PRESETS.map((preset) => (
              <button
                key={preset.value}
                type="button"
                title={preset.label}
                aria-label={preset.label}
                onClick={() => setBgColor(preset.value)}
                className={
                  bgColor === preset.value
                    ? "h-8 w-8 rounded-full border-2 border-slate-900 ring-2 ring-offset-1 ring-slate-300"
                    : "h-8 w-8 rounded-full border border-slate-300 hover:scale-110 transition"
                }
                style={{ backgroundColor: preset.value }}
              />
            ))}
            <input
              type="color"
              value={bgColor || "#f8fafc"}
              onChange={(e) => setBgColor(e.target.value)}
              aria-label="Custom background color"
              className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
            />
            <Input
              value={bgColor}
              onChange={(e) => setBgColor(e.target.value)}
              placeholder="#f8fafc"
              className="h-8 w-28 font-mono text-xs"
            />
            {bgColor && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setBgColor("")}
              >
                Clear
              </Button>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Painted behind the slide. Leave empty for the default sunrise
            gradient. Dark colors flip the headline to white automatically.
          </p>
        </div>
      </div>

      {imageUrl && (
        <div className="rounded-lg border bg-slate-50/60 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Switch
              checked={showWholeImage}
              onCheckedChange={setShowWholeImage}
            />
            <div>
              <p className="text-sm font-medium">Show the whole image</p>
              <p className="text-xs text-muted-foreground">
                Turn this on for flyers and posters with text in them: the
                image sits beside the headline at full height with nothing
                cropped or faded. Leave it off for wide photos that should
                fill the hero behind the text.
              </p>
            </div>
          </div>

          {showWholeImage && (
            <div className="border-t pt-4">
              <Label className="mb-2 block">Image placement</Label>
              <div className="flex flex-wrap gap-2">
                {HERO_IMAGE_POSITIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setImagePosition(opt.value)}
                    className={
                      imagePosition === opt.value
                        ? "rounded-full px-3 py-1.5 text-xs font-medium bg-slate-900 text-white"
                        : "rounded-full px-3 py-1.5 text-xs font-medium border bg-white text-slate-700 hover:border-teal-300"
                    }
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                The image is sized from its own proportions to fill as much of
                the hero as it can — tall posters get height, wide banners get
                width.
              </p>
            </div>
          )}

          <div className="flex items-start gap-3 border-t pt-4">
            <Switch checked={allowDownload} onCheckedChange={setAllowDownload} />
            <div>
              <p className="text-sm font-medium">
                Let visitors download this image
              </p>
              <p className="text-xs text-muted-foreground">
                Adds a &quot;Download image&quot; button to the slide so people
                can save the flyer and share it.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="primary_cta_text">Primary button text</Label>
          <Input
            id="primary_cta_text"
            name="primary_cta_text"
            defaultValue={slide?.primary_cta_text || ""}
            placeholder="Find Support"
          />
        </div>
        <div>
          <Label htmlFor="primary_cta_url">Primary button URL</Label>
          <Input
            id="primary_cta_url"
            name="primary_cta_url"
            defaultValue={slide?.primary_cta_url || ""}
            placeholder="/services"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="secondary_cta_text">Secondary button text</Label>
          <Input
            id="secondary_cta_text"
            name="secondary_cta_text"
            defaultValue={slide?.secondary_cta_text || ""}
            placeholder="Explore Classes"
          />
        </div>
        <div>
          <Label htmlFor="secondary_cta_url">Secondary button URL</Label>
          <Input
            id="secondary_cta_url"
            name="secondary_cta_url"
            defaultValue={slide?.secondary_cta_url || ""}
            placeholder="/classes"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="order_index">Display order</Label>
          <Input
            id="order_index"
            name="order_index"
            type="number"
            defaultValue={slide?.order_index ?? 0}
            min={0}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Lower numbers appear first.
          </p>
        </div>
        <div className="flex flex-col justify-center">
          <Label className="mb-2">Active</Label>
          <div className="flex items-center gap-2">
            <Switch checked={active} onCheckedChange={setActive} />
            <span className="text-sm text-muted-foreground">
              {active ? "Visible on homepage" : "Hidden"}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : slide ? "Save changes" : "Add slide"}
        </Button>
        {onDone && (
          <Button type="button" variant="outline" onClick={onDone} disabled={pending}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
