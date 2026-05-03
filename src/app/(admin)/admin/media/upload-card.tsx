"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload as UploadIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FileUpload } from "@/components/admin/file-upload"

const FOLDERS = [
  "uploads",
  "logos",
  "hero-slides",
  "services",
  "blog",
  "provider-logos",
]

export function MediaUploadCard() {
  const router = useRouter()
  const [folder, setFolder] = useState("uploads")
  const [lastUploadUrl, setLastUploadUrl] = useState("")

  const handleUploaded = (url: string) => {
    setLastUploadUrl(url)
    if (url) router.refresh()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UploadIcon className="h-4 w-4" />
          Upload new file
        </CardTitle>
        <CardDescription>
          Upload an image, video, or PDF to the media bucket. Pick a folder so
          it&apos;s easy to find later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <Label>Folder</Label>
          <Select value={folder} onValueChange={setFolder}>
            <SelectTrigger className="w-full sm:w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FOLDERS.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>File</Label>
          <FileUpload
            value={lastUploadUrl}
            onChange={handleUploaded}
            folder={folder}
            accept="any"
          />
        </div>
      </CardContent>
    </Card>
  )
}
