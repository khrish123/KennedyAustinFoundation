export interface EcmProvider {
  id: string
  name: string
  slug: string | null
  description: string | null
  logo_url: string | null
  website_url: string | null
  phone: string | null
  populations_served: string | null
  order_index: number
  is_visible: boolean
  created_at: string
  updated_at: string
}
