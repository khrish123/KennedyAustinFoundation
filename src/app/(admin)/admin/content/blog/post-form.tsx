"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { FileUpload } from "@/components/admin/file-upload"
import type { BlogPost } from "@/types/blog"
import { createPostAction, updatePostAction } from "./actions"

interface PostFormProps {
  post?: BlogPost
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [coverImageUrl, setCoverImageUrl] = useState(post?.cover_image_url || "")
  const [published, setPublished] = useState(post?.is_published ?? false)

  const isEdit = !!post

  const handleSubmit = (formData: FormData) => {
    setError(null)
    setSuccess(false)
    formData.set("cover_image_url", coverImageUrl)
    formData.set("is_published", published ? "true" : "false")

    startTransition(async () => {
      const result = isEdit
        ? await updatePostAction(post!.id, formData)
        : await createPostAction(formData)

      if (result?.error) {
        setError(result.error)
        return
      }
      if (isEdit) {
        setSuccess(true)
        router.refresh()
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <Link
          href="/admin/content/blog"
          className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
        >
          <ArrowLeft className="h-3 w-3 mr-1" />
          All posts
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEdit ? "Edit post" : "New post"}
            </h1>
            <p className="text-muted-foreground">
              {isEdit
                ? "Saved changes are visible immediately on /blog if the post is published."
                : "The post is created as a draft. Toggle Published below when you're ready."}
            </p>
          </div>
          {isEdit && post?.is_published && post?.slug && (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/blog/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View public page
                <ExternalLink className="ml-2 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Basics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Title <span className="text-rose-600">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              required
              defaultValue={post?.title || ""}
              placeholder="What I learned about grief in the first year"
            />
          </div>
          <div>
            <Label htmlFor="slug">URL slug</Label>
            <Input
              id="slug"
              name="slug"
              defaultValue={post?.slug || ""}
              placeholder="auto-generated from title"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Public URL: /blog/<em>your-slug</em>. Leave blank to auto-generate.
            </p>
          </div>
          <div>
            <Label htmlFor="excerpt">Excerpt / summary</Label>
            <Textarea
              id="excerpt"
              name="excerpt"
              rows={3}
              defaultValue={post?.excerpt || ""}
              placeholder="One- or two-sentence summary shown on the blog index and in shares."
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Content</CardTitle>
          <CardDescription>
            Write the body. Blank lines start new paragraphs. Lines starting with
            # become headings (## for sub-headings).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="body">
              Body <span className="text-rose-600">*</span>
            </Label>
            <Textarea
              id="body"
              name="body"
              required
              rows={18}
              defaultValue={post?.body || ""}
              placeholder={`# Big idea\n\nFirst paragraph of the article.\n\nA second paragraph after a blank line.\n\n## A sub-section\n\nMore text here.`}
              className="font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cover image</CardTitle>
        </CardHeader>
        <CardContent>
          <FileUpload
            value={coverImageUrl}
            onChange={setCoverImageUrl}
            folder="blog"
            accept="image"
            previewClassName="h-40"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Categorization</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              name="category"
              defaultValue={post?.category || ""}
              placeholder="Grief, Family, Wellness…"
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={post?.tags?.join(", ") || ""}
              placeholder="comma, separated, tags"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <Switch checked={published} onCheckedChange={setPublished} />
            <div>
              <p className="font-medium text-sm">
                {published ? "Published" : "Draft"}
              </p>
              <p className="text-xs text-muted-foreground">
                {published
                  ? "Visible on /blog and the post URL."
                  : "Hidden from the public blog. Only admins can preview."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-700">
          Post saved.
        </div>
      )}

      <div className="sticky bottom-4 flex gap-2 justify-end">
        <Button asChild type="button" variant="outline">
          <Link href="/admin/content/blog">Cancel</Link>
        </Button>
        <Button type="submit" disabled={pending} size="lg">
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create post"}
        </Button>
      </div>
    </form>
  )
}
