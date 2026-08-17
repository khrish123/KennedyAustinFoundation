export interface HeroSlide {
  id: string
  title: string
  subtitle: string | null
  background_image_url: string | null
  background_video_url: string | null
  primary_cta_text: string | null
  primary_cta_url: string | null
  secondary_cta_text: string | null
  secondary_cta_url: string | null
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  /**
   * "contain" shows a whole flyer/poster beside the copy instead of cropping
   * it to fill the hero band.
   */
  image_fit?: "cover" | "contain"
  /** Offers visitors a download button for the slide image. */
  allow_download?: boolean
  /** Runtime-only (not a DB column): overrides the default hero badge text. */
  eyebrow?: string | null
  /** Runtime-only (not a DB column): where a download button should point. */
  download_url?: string | null
}

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    id: "default-1",
    title: "You Are Not Alone. Hope Lives Here.",
    subtitle:
      "At the Kennedy Austin Foundation, we believe in the power of compassion and community. Whether you're facing crisis, loss, or simply seeking support, we're here to walk alongside you.",
    background_image_url: null,
    background_video_url: null,
    primary_cta_text: "Find Support",
    primary_cta_url: "/services",
    secondary_cta_text: "Explore Classes",
    secondary_cta_url: "/classes",
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
