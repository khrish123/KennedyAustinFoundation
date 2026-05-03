export interface ServiceItem {
  id: string
  slug: string
  title: string
  short_description: string | null
  long_description: string | null
  icon_name: string | null
  color_class: string | null
  bg_color_class: string | null
  image_url: string | null
  features: string[] | null
  href_anchor: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AboutValue {
  id: string
  title: string
  description: string
  icon_name: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface AboutMilestone {
  id: string
  year: string
  title: string
  description: string | null
  order_index: number
  is_published: boolean
  created_at: string
  updated_at: string
}
