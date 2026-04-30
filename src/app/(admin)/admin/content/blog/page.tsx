import { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getAllPostsForAdmin } from "@/lib/queries/blog"
import { PostRowActions } from "./post-row-actions"

export const metadata: Metadata = {
  title: "Blog | Admin",
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export default async function AdminBlogPage() {
  const { posts, tableMissing } = await getAllPostsForAdmin()
  const publishedCount = posts.filter((p) => p.is_published).length
  const draftCount = posts.length - publishedCount

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <Link
            href="/admin/content"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-2"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            Content
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Blog</h1>
          <p className="text-muted-foreground">
            Articles published to{" "}
            <Link href="/blog" className="text-teal-700 hover:underline">
              /blog
            </Link>
            .
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New post
          </Link>
        </Button>
      </div>

      {tableMissing && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-amber-900 text-base">
              Database table not found
            </CardTitle>
            <CardDescription className="text-amber-900/80">
              Apply{" "}
              <code className="px-1 rounded bg-amber-100">
                supabase/migrations/010_blog_posts.sql
              </code>{" "}
              in the Supabase SQL editor, then refresh.
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{posts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{publishedCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.length > 0 ? (
                posts.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium text-slate-900">
                        {p.title}
                      </div>
                      {p.excerpt && (
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-md">
                          {p.excerpt}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.category ? (
                        <Badge variant="outline" className="text-xs">
                          {p.category}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(p.updated_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <PostRowActions
                        id={p.id}
                        slug={p.slug}
                        title={p.title}
                        isPublished={p.is_published}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">No posts yet</p>
                    <Button asChild className="mt-4">
                      <Link href="/admin/content/blog/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Write the first post
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
