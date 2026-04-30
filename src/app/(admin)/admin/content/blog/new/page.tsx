import { Metadata } from "next"
import { PostForm } from "../post-form"

export const metadata: Metadata = {
  title: "New post | Admin",
}

export default function NewPostPage() {
  return <PostForm />
}
