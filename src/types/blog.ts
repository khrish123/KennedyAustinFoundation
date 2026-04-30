export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  body: string
  cover_image_url: string | null
  category: string | null
  tags: string[] | null
  author_id: string | null
  is_published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
  author?: { full_name: string | null; avatar_url: string | null } | null
}
