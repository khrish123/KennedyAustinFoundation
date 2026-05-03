import { Metadata } from "next"
import { ImageIcon, FolderOpen } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { listMediaFiles } from "@/lib/queries/media"
import { FileCard } from "./file-card"
import { MediaUploadCard } from "./upload-card"

export const metadata: Metadata = {
  title: "Media Library | Admin",
}

export default async function AdminMediaLibraryPage() {
  const { byFolder, totalFiles, bucketMissing, rootError } = await listMediaFiles()
  const populated = byFolder.filter((f) => f.files.length > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          All files in the Supabase Storage <code>media</code> bucket. Used by
          hero slides, services, blog covers, and more.
        </p>
      </div>

      {bucketMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Storage bucket not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/007_storage_media.sql
              </code>{" "}
              in the Supabase SQL editor first.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {!bucketMissing && rootError && (
        <Card className="border-rose-300 bg-rose-50">
          <CardHeader>
            <CardTitle className="text-rose-900 text-base">
              Could not list media
            </CardTitle>
            <CardDescription className="text-rose-900/80 break-all">
              {rootError}
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <MediaUploadCard />

      <p className="text-xs text-muted-foreground">
        {totalFiles} {totalFiles === 1 ? "file" : "files"} across{" "}
        {populated.length} {populated.length === 1 ? "folder" : "folders"}.
      </p>

      {populated.length === 0 && !bucketMissing && (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <ImageIcon className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No files yet. Upload one above, or any image/video uploaded via
              other admin forms (hero slides, services, blog, settings logo,
              etc.) will land here automatically.
            </p>
          </CardContent>
        </Card>
      )}

      {populated.map((group) => (
        <div key={group.folder}>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">{group.folder}</h2>
            <Badge variant="outline" className="text-xs">
              {group.files.length}
            </Badge>
          </div>
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {group.files.map((f) => (
              <FileCard key={f.fullPath} file={f} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
