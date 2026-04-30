import { Metadata } from "next"
import Link from "next/link"
import { BookOpen, ArrowRight, Calendar } from "lucide-react"
import { SiteHeader } from "@/components/layout/site-header"
import { SiteFooter } from "@/components/layout/site-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPublishedPosts } from "@/lib/queries/blog"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Articles, stories, and reflections from the Kennedy Austin Foundation community.",
}

function formatDate(iso: string | null) {
  if (!iso) return ""
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts(50)

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="bg-gradient-to-b from-teal-50 to-white">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-teal-100">
              <BookOpen className="h-6 w-6 text-teal-700" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Stories &amp; Reflections
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Articles from our team and community on grief, healing, family, and
              the long road back from loss.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle>Our blog is coming soon</CardTitle>
                <CardDescription>
                  We&apos;re collecting stories from families, counselors, and
                  community members. The first articles will be published shortly.
                  In the meantime, take a look at our resources.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-3">
                <Button asChild>
                  <Link href="/resources">
                    Browse Resources
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/contact">Submit Your Story</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="block group"
                >
                  <Card className="h-full overflow-hidden hover:border-teal-300 transition">
                    {post.cover_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.cover_image_url}
                        alt=""
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div className="h-44 w-full bg-gradient-to-br from-teal-100 via-amber-100 to-rose-100 flex items-center justify-center">
                        <BookOpen className="h-10 w-10 text-teal-700" />
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2 flex-wrap">
                        {post.category && (
                          <Badge variant="outline" className="text-xs">
                            {post.category}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>
                      <CardTitle className="text-xl group-hover:text-teal-700 transition">
                        {post.title}
                      </CardTitle>
                      {post.excerpt && (
                        <CardDescription className="line-clamp-3">
                          {post.excerpt}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center text-sm font-medium text-teal-700">
                        Read more
                        <ArrowRight className="ml-1 h-3 w-3 transition group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}
