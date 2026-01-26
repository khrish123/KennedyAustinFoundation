"use client"

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
  Image,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"

const navigation = [
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
    name: "Content",
    href: "/admin/content",
    icon: FileText,
  },
  {
    name: "Campaigns",
    href: "/admin/campaigns",
    icon: Mail,
    badge: "Marketing",
  },
  {
    name: "Media Library",
    href: "/admin/media",
    icon: Image,
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
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r bg-background">
      <div className="px-4 py-4 border-b">
        <h2 className="text-lg font-semibold">Admin Panel</h2>
        <p className="text-xs text-muted-foreground">Manage your platform</p>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </span>
                {item.badge && (
                  <Badge variant="secondary" className="text-[10px] px-1.5">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
