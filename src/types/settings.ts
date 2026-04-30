export interface SiteSettings {
  id: string
  site_name: string
  site_tagline: string | null
  logo_url: string | null
  primary_phone: string | null
  crisis_line: string | null
  primary_email: string | null
  address: string | null
  founded_year: number | null
  founder_name: string | null
  footer_about: string | null
  newsletter_blurb: string | null
  facebook_url: string | null
  instagram_url: string | null
  twitter_url: string | null
  youtube_url: string | null
  copyright_text: string | null
  created_at: string
  updated_at: string
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  id: "default",
  site_name: "Kennedy Austin Foundation",
  site_tagline: "Crisis Intervention & Family Support",
  logo_url: null,
  primary_phone: "909-808-6866",
  crisis_line: "988",
  primary_email: "admin@kennedyaustinfoundation.com",
  address: "Pomona, CA",
  founded_year: 1993,
  founder_name: "Ms. Ethel Gardner",
  footer_about:
    "Supporting youth and families through the traumas of life and loss since 1993. A family crisis intervention center serving Pomona, Claremont, and La Verne, California.",
  newsletter_blurb:
    "Subscribe to our newsletter for updates, resources, and inspiration on your healing journey.",
  facebook_url: "https://facebook.com",
  instagram_url: "https://instagram.com",
  twitter_url: "https://twitter.com",
  youtube_url: "https://youtube.com",
  copyright_text: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}
