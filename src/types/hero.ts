export type HeroImagePosition = "left" | "right" | "center"

export const HERO_IMAGE_POSITIONS: { value: HeroImagePosition; label: string }[] =
  [
    { value: "left", label: "Left of the text" },
    { value: "right", label: "Right of the text" },
    { value: "center", label: "Centered, text above" },
  ]

/** Backdrop presets offered in the admin color picker. */
export const HERO_BACKGROUND_PRESETS: { value: string; label: string }[] = [
  { value: "#f8fafc", label: "Soft white" },
  { value: "#fef3c7", label: "Warm amber" },
  { value: "#ccfbf1", label: "Mint" },
  { value: "#ffe4e6", label: "Blush" },
  { value: "#0f766e", label: "Deep teal" },
  { value: "#1e293b", label: "Slate night" },
]

const HEX_RE = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

export function normalizeHexColor(value: string | null | undefined): string | null {
  if (!value) return null
  const v = value.trim()
  return HEX_RE.test(v) ? v.toLowerCase() : null
}

/**
 * Perceived luminance, so a dark backdrop can flip the hero copy to light text
 * instead of leaving unreadable slate-on-navy.
 */
export function isDarkColor(hex: string): boolean {
  let h = hex.replace("#", "")
  if (h.length === 3) h = h.split("").map((c) => c + c).join("")
  const r = parseInt(h.slice(0, 2), 16) / 255
  const g = parseInt(h.slice(2, 4), 16) / 255
  const b = parseInt(h.slice(4, 6), 16) / 255
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 0.5
}

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
  /** #rrggbb backdrop for the slide, or null for the default sunrise gradient. */
  background_color?: string | null
  /** Where a whole-image (contain) flyer sits relative to the copy. */
  image_position?: HeroImagePosition
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
