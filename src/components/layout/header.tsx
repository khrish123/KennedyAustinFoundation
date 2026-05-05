"use client"

import Link from "next/link"
import { useState } from "react"
import {
  Menu,
  X,
  Heart,
  Phone,
  User,
  LogOut,
  Settings,
  BookOpen,
  MessageSquare,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn, getInitials } from "@/lib/utils"
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/settings"

export interface HeaderUser {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  role?: string
}

interface HeaderProps {
  user?: HeaderUser | null
  /** Optional fresh settings. Falls back to DEFAULT_SITE_SETTINGS when omitted. */
  settings?: SiteSettings
}

const navigation = [
  { name: "Home", href: "/" },
  { name: "About", href: "/about" },
  { name: "Services", href: "/services" },
  { name: "ECM", href: "/ecm" },
  { name: "Classes", href: "/classes" },
  { name: "Events", href: "/events" },
  { name: "Resources", href: "/resources" },
  { name: "Community", href: "/community" },
  { name: "Contact", href: "/contact" },
]

export function Header({ user, settings = DEFAULT_SITE_SETTINGS }: HeaderProps = {}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const tagline = settings.site_tagline

  const phone = settings.primary_phone
  const crisis = settings.crisis_line

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
      {(phone || crisis) && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white py-1.5 text-center text-sm font-medium">
          <Phone className="inline h-3 w-3 mr-1" />
          {phone && (
            <>
              Need help? Call:{" "}
              <a
                href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                className="font-bold underline"
              >
                {phone}
              </a>
            </>
          )}
          {phone && crisis && " | "}
          {crisis && (
            <>
              National Lifeline:{" "}
              <a
                href={`tel:${crisis.replace(/[^0-9+]/g, "")}`}
                className="font-bold underline"
              >
                {crisis}
              </a>
            </>
          )}{" "}
          <span className="hidden sm:inline">- You are not alone</span>
        </div>
      )}

      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 p-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 flex-shrink-0">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={settings.logo_url} alt={siteName} className="h-10 w-auto" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700 shadow-warm">
              <Heart className="h-5 w-5 text-white" />
            </div>
          )}
          <div className="hidden sm:block leading-tight">
            <span className="text-base xl:text-lg font-bold text-slate-900 whitespace-nowrap">
              {siteName}
            </span>
            {tagline && (
              <span className="hidden xl:block text-xs text-slate-600">
                {tagline}
              </span>
            )}
          </div>
        </Link>

        <div className="hidden xl:flex xl:gap-x-5">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-semibold text-slate-700 transition-colors hover:text-teal-700 whitespace-nowrap"
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <Button asChild variant="default" size="sm" className="hidden sm:inline-flex">
            <Link href="/donate">
              <Heart className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Donate</span>
            </Link>
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.avatar_url || undefined}
                      alt={user.full_name || user.email}
                    />
                    <AvatarFallback>
                      {getInitials(user.full_name || user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-classes">
                    <BookOpen className="mr-2 h-4 w-4" />
                    My Classes
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/messages">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    My Messages
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                {user.role && ["admin", "super_admin"].includes(user.role) && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/admin">
                        <Settings className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/api/auth/signout">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </nav>

      <div className={cn("xl:hidden", mobileMenuOpen ? "block" : "hidden")}>
        <div className="space-y-1 px-4 pb-4 bg-white border-t border-slate-100">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-md px-3 py-2 text-base font-semibold text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 flex flex-col gap-2">
            <Button asChild variant="default" className="w-full shadow-warm">
              <Link href="/donate">
                <Heart className="mr-2 h-4 w-4" />
                Donate
              </Link>
            </Button>
            {!user && (
              <Button asChild variant="outline" className="w-full border-amber-200">
                <Link href="/login">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
