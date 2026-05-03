"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Mail,
  DollarSign,
  BarChart3,
  Settings,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  ChevronDown,
  Sparkles,
  HeartHandshake,
  HelpCircle,
  Heart,
  Shield,
  type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

interface NavChild {
  name: string
  href: string
  icon?: LucideIcon
  badge?: string
}

interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: string
  comingSoon?: boolean
  children?: NavChild[]
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Classes",
    href: "/admin/classes",
    icon: BookOpen,
  },
  {
    name: "Events",
    href: "/admin/events",
    icon: Calendar,
  },
  {
    name: "Content",
    href: "/admin/content",
    icon: FileText,
    children: [
      { name: "Hero Slides", href: "/admin/content/hero-slides", icon: Sparkles },
      { name: "ECM Providers", href: "/admin/content/ecm-providers", icon: HeartHandshake },
      { name: "FAQs", href: "/admin/content/faqs", icon: HelpCircle },
      { name: "Resources", href: "/admin/content/resources", icon: BookOpen },
      { name: "Daily Inspirations", href: "/admin/content/daily-inspirations", icon: Sparkles },
      { name: "Blog Posts", href: "/admin/content/blog", icon: FileText },
      { name: "Services", href: "/admin/content/services", icon: Shield },
      { name: "About — Values", href: "/admin/content/about-values", icon: Heart },
      { name: "About — Milestones", href: "/admin/content/about-milestones", icon: Calendar },
    ],
  },
  {
    name: "Campaigns",
    href: "/admin/campaigns",
    icon: Mail,
  },
  {
    name: "Media Library",
    href: "/admin/media",
    icon: ImageIcon,
  },
  {
    name: "Donations",
    href: "/admin/donations",
    icon: DollarSign,
  },
  {
    name: "Support Requests",
    href: "/admin/support",
    icon: MessageSquare,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
    children: [
      { name: "Site Settings", href: "/admin/settings", icon: Settings },
      { name: "Email Settings", href: "/admin/settings/email", icon: Mail },
    ],
  },
]

function isItemActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin"
  return pathname === href || pathname.startsWith(href + "/")
}

function isExactActive(pathname: string, href: string) {
  return pathname === href
}

export function AdminSidebar() {
  const pathname = usePathname()

  // Track which sections are manually expanded. Sections with an active child
  // expand automatically regardless of this state.
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  const toggle = (name: string) =>
    setExpanded((s) => ({ ...s, [name]: !s[name] }))

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
      <div className="px-4 py-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-xs text-muted-foreground">Manage your platform</p>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const hasChildren = !!item.children?.length
            const childActive =
              hasChildren &&
              item.children!.some((c) => isItemActive(pathname, c.href))
            const sectionActive = isItemActive(pathname, item.href) || childActive
            const isOpen = childActive || expanded[item.name] === true

            // Plain item — no children
            if (!hasChildren) {
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    sectionActive
                      ? "bg-primary text-primary-foreground"
                      : item.comingSoon
                        ? "text-muted-foreground/60 hover:bg-muted hover:text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  {item.badge && (
                    <Badge
                      variant={item.comingSoon ? "outline" : "secondary"}
                      className="text-[10px] px-1.5"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              )
            }

            // Item with children — collapsible header + nested links
            return (
              <div key={item.name}>
                <button
                  type="button"
                  onClick={() => toggle(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    sectionActive
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-3">
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isOpen ? "rotate-0" : "-rotate-90"
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l space-y-0.5">
                    {item.children!.map((child) => {
                      const ChildIcon = child.icon
                      const childIsActive = isExactActive(pathname, child.href)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-colors",
                            childIsActive
                              ? "bg-primary text-primary-foreground"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                          {child.name}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
