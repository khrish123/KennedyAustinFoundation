import { Metadata } from "next"
import { Image as ImageIcon, Video, Construction } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Media Library | Admin",
}

export default function AdminMediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Media Library</h1>
        <p className="text-muted-foreground">
          Manage images, videos, and downloadable files used across the site.
        </p>
      </div>

      <Card className="border-dashed">
        <CardHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Construction className="h-5 w-5" />
          </div>
          <CardTitle>Coming soon</CardTitle>
          <CardDescription>
            The media library is under construction. Videos will be hosted on Mux; images and PDFs on
            Supabase Storage. You&apos;ll be able to upload, browse, and reuse assets across classes,
            lessons, and resources from this page.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 mb-4">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                <Video className="h-4 w-4 text-teal-700" />
                Video (Mux)
              </div>
              <p className="text-xs text-muted-foreground">
                Class lessons, recorded sessions, intro videos.
              </p>
            </div>
            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                <ImageIcon className="h-4 w-4 text-teal-700" />
                Images & PDFs (Supabase)
              </div>
              <p className="text-xs text-muted-foreground">
                Class thumbnails, lesson resources, blog imagery.
              </p>
            </div>
          </div>
          <Button disabled>Upload coming soon</Button>
        </CardContent>
      </Card>
    </div>
  )
}
