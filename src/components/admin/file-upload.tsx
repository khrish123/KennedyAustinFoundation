"use client"

import { useRef, useState } from "react"
import { Upload, X, Link as LinkIcon, Image as ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  /** Current value (URL). Either a Supabase Storage public URL or any external URL. */
  value: string
  onChange: (url: string) => void
  /** Folder inside the `media` bucket (e.g. "logos", "hero-slides"). */
  folder?: string
  /** "image", "video", "any". Controls the file picker filter. */
  accept?: "image" | "video" | "any"
  /** Class names for the preview thumbnail container. */
  previewClassName?: string
  /** Optional placeholder for the URL input. */
  placeholder?: string
}

export function FileUpload({
  value,
  onChange,
  folder = "uploads",
  accept = "any",
  previewClassName,
  placeholder = "https://… or upload below",
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const acceptAttr =
    accept === "image"
      ? "image/*"
      : accept === "video"
        ? "video/mp4,video/webm"
        : "image/*,video/mp4,video/webm,application/pdf"

  const isVideo = (url: string) => /\.(mp4|webm|mov)(\?|$)/i.test(url)
  const isImage = (url: string) =>
    /\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(url)

  const handleUpload = async (file: File) => {
    setError(null)
    setUploading(true)
    setProgress(10)

    try {
      const supabase = createClient()
      const ext = file.name.split(".").pop()?.toLowerCase() || "bin"
      const safeBase = file.name
        .replace(/\.[^.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]+/g, "-")
        .slice(0, 40)
      const stamp = Date.now()
      const path = `${folder}/${stamp}-${safeBase}.${ext}`

      setProgress(40)
      const { error: uploadError } = await supabase.storage
        .from("media")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        })

      if (uploadError) throw uploadError

      setProgress(80)
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path)

      setProgress(100)
      onChange(pub.publicUrl)
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed"
      setError(
        msg.includes("Bucket not found")
          ? "Storage bucket 'media' not found. Apply migration 007_storage_media.sql in Supabase."
          : msg
      )
    } finally {
      setUploading(false)
      setTimeout(() => setProgress(0), 800)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? `${progress}%` : "Upload"}
        </Button>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange("")}
            title="Clear"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptAttr}
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {value && (
        <div
          className={cn(
            "rounded-lg border bg-muted/30 overflow-hidden flex items-center justify-center",
            previewClassName || "h-32"
          )}
        >
          {isVideo(value) ? (
            <video
              src={value}
              controls
              muted
              className="max-h-full max-w-full"
            />
          ) : isImage(value) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="preview"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground p-3">
              <LinkIcon className="h-4 w-4" />
              <span className="truncate max-w-md">{value}</span>
            </div>
          )}
        </div>
      )}

      {!value && (
        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <ImageIcon className="h-3 w-3" />
          Paste a URL or click Upload to add a file (max 50 MB).
        </p>
      )}
    </div>
  )
}
