"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  PenTool,
  BarChart3,
  Users,
  Settings,
  MessageCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "My Classes",
    href: "/my-classes",
    icon: BookOpen,
  },
  {
    name: "Journal",
    href: "/journal",
    icon: PenTool,
  },
  {
    name: "Progress",
    href: "/progress",
    icon: BarChart3,
  },
  {
    name: "Community",
    href: "/community",
    icon: Users,
  },
  {
    name: "AI Support",
    href: "/chat",
    icon: MessageCircle,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r border-slate-200 bg-white">
      <ScrollArea className="flex-1 py-4">
        <nav className="px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                  isActive
                    ? "bg-teal-600 text-white shadow-warm"
                    : "text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
    </aside>
  )
}
