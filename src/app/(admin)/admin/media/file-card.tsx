"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import {
  Copy,
  Trash2,
  ExternalLink,
  FileVideo,
  FileText,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import type { MediaFile } from "@/lib/queries/media"
import { deleteMediaFileAction } from "./actions"

interface FileCardProps {
  file: MediaFile
}

function isImage(file: MediaFile) {
  return (
    file.mimeType?.startsWith("image/") ||
    /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(file.name)
  )
}

function isVideo(file: MediaFile) {
  return (
    file.mimeType?.startsWith("video/") ||
    /\.(mp4|webm|mov|m4v)$/i.test(file.name)
  )
}

function prettyBytes(bytes: number | null) {
  if (!bytes) return "—"
  const units = ["B", "KB", "MB", "GB"]
  let v = bytes
  let i = 0
  while (v > 1024 && i < units.length - 1) {
    v /= 1024
    i++
  }
  return `${v.toFixed(v < 10 ? 1 : 0)} ${units[i]}`
}

export function FileCard({ file }: FileCardProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [pending, startTransition] = useTransition()

  const copy = () => {
    navigator.clipboard.writeText(file.publicUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = () => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return
    startTransition(async () => {
      const result = await deleteMediaFileAction(file.fullPath)
      if (result?.error) {
        alert(`Failed: ${result.error}`)
        return
      }
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group block text-left rounded-lg border bg-background overflow-hidden hover:border-teal-300 transition"
      >
        <div className="aspect-square bg-muted/30 flex items-center justify-center">
          {isImage(file) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.publicUrl}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : isVideo(file) ? (
            <FileVideo className="h-12 w-12 text-muted-foreground" />
          ) : (
            <FileText className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
        <div className="p-2">
          <p className="text-xs font-medium truncate" title={file.name}>
            {file.name}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {prettyBytes(file.sizeBytes)}
          </p>
        </div>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="truncate">{file.name}</DialogTitle>
            <DialogDescription>
              {file.folder} · {prettyBytes(file.sizeBytes)} ·{" "}
              {file.mimeType || "unknown type"}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border bg-muted/30 overflow-hidden">
            {isImage(file) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={file.publicUrl}
                alt={file.name}
                className="w-full max-h-96 object-contain"
              />
            ) : isVideo(file) ? (
              <video
                src={file.publicUrl}
                controls
                className="w-full max-h-96"
              />
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Preview not available for this file type.
              </div>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium">Public URL</p>
            <div className="flex gap-2">
              <Input value={file.publicUrl} readOnly className="text-xs font-mono" />
              <Button type="button" variant="outline" onClick={copy}>
                {copied ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-emerald-600" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t">
            <Button asChild variant="outline">
              <a href={file.publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1" />
                Open in new tab
              </a>
            </Button>
            <Button
              variant="ghost"
              onClick={handleDelete}
              disabled={pending}
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-50 ml-auto"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
