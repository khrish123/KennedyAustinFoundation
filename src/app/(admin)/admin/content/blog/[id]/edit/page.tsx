import { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPostByIdForAdmin } from "@/lib/queries/blog"
import { PostForm } from "../../post-form"

export const metadata: Metadata = {
  title: "Edit post | Admin",
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const post = await getPostByIdForAdmin(id)
  if (!post) notFound()
  return <PostForm post={post} />
}
