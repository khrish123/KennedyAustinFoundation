import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar, User as UserIcon } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Badge } from "@/components/ui/badge"
import { getPostBySlug } from "@/lib/queries/blog"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return { title: "Post not found" }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  }
}

function formatDate(iso: string | null) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Render the post body as paragraphs. The admin enters markdown-ish text
 * (blank lines split paragraphs); we render simply for now and can swap in a
 * proper markdown parser later without changing the data shape.
 */
function renderBody(body: string) {
  const blocks = body.split(/\n{2,}/).map((b) => b.trim()).filter(Boolean)
  return blocks.map((block, i) => {
    if (block.startsWith("## ")) {
      return (
        <h2 key={i} className="text-2xl font-semibold text-slate-900 mt-8 mb-3">
          {block.replace(/^##\s+/, "")}
        </h2>
      )
    }
    if (block.startsWith("# ")) {
      return (
        <h1 key={i} className="text-3xl font-bold text-slate-900 mt-8 mb-3">
          {block.replace(/^#\s+/, "")}
        </h1>
      )
    }
    return (
      <p key={i} className="text-slate-800 leading-7 mb-4 whitespace-pre-line">
        {block}
      </p>
    )
  })
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  const dateLabel = formatDate(post.published_at || post.created_at)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        {post.cover_image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.cover_image_url}
            alt=""
            className="w-full h-64 sm:h-80 object-cover"
          />
        )}

        <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-xs text-muted-foreground hover:text-foreground mb-3"
          >
            <ArrowLeft className="h-3 w-3 mr-1" />
            All articles
          </Link>

          <div className="flex items-center gap-2 flex-wrap mb-3">
            {post.category && (
              <Badge variant="outline" className="text-xs">
                {post.category}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {dateLabel}
            </span>
            {post.author?.full_name && (
              <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                {post.author.full_name}
              </span>
            )}
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-4">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-lg text-slate-600 mb-8">{post.excerpt}</p>
          )}

          <div className="prose prose-slate max-w-none">
            {renderBody(post.body)}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t flex flex-wrap gap-2">
              {post.tags.map((t) => (
                <Badge key={t} variant="secondary" className="text-xs">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </article>
      </main>
      <SiteFooter />
    </div>
  )
}
