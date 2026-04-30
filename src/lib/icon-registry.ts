import {
  Heart,
  Users,
  Shield,
  Sparkles,
  BookOpen,
  Target,
  Award,
  Phone,
  MapPin,
  Clock,
  Calendar,
  MessageCircle,
  HandHeart,
  HeartHandshake,
  Sun,
  Leaf,
  HelpCircle,
  Star,
  Mail,
  CheckCircle,
  Activity,
  ShieldCheck,
  HandHelping,
  Building2,
  type LucideIcon,
} from "lucide-react"

/**
 * Curated set of icons that admins can pick from when authoring content.
 * If a name isn't in the registry, callers fall back to the default.
 */
export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Heart,
  Users,
  Shield,
  Sparkles,
  BookOpen,
  Target,
  Award,
  Phone,
  MapPin,
  Clock,
  Calendar,
  MessageCircle,
  HandHeart,
  HeartHandshake,
  Sun,
  Leaf,
  HelpCircle,
  Star,
  Mail,
  CheckCircle,
  Activity,
  ShieldCheck,
  HandHelping,
  Building2,
}

export const ICON_NAMES = Object.keys(ICON_REGISTRY).sort()

export function getIcon(name: string | null | undefined, fallback: LucideIcon = Sparkles): LucideIcon {
  if (!name) return fallback
  return ICON_REGISTRY[name] || fallback
}
