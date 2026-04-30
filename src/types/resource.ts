export type ResourceType = "article" | "video" | "pdf" | "link"

export interface Resource {
  id: string
  title: string
  description: string | null
  category: string
  type: ResourceType
  url: string | null
  phone: string | null
  content: string | null
  is_crisis_resource: boolean
  is_published: boolean
  order_index: number
  created_at: string
  updated_at?: string
}
