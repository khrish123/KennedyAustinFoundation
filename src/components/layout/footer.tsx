import Link from "next/link"
import { Heart, Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { DEFAULT_SITE_SETTINGS, type SiteSettings } from "@/types/settings"
import { NewsletterForm } from "./newsletter-form"

interface FooterProps {
  settings?: SiteSettings
}

const footerLinks = {
  services: [
    { name: "Crisis Intervention", href: "/services#crisis" },
    { name: "Grief Counseling", href: "/services#grief" },
    { name: "DV Support", href: "/services#dv" },
    { name: "Youth Programs", href: "/services#youth" },
    { name: "Family Support", href: "/services#family" },
  ],
  classes: [
    { name: "Grief Recovery", href: "/classes?category=grief" },
    { name: "Self-Help", href: "/classes?category=self_help" },
    { name: "Therapy Sessions", href: "/classes?category=therapy" },
    { name: "Wellness Programs", href: "/classes?category=wellness" },
    { name: "All Classes", href: "/classes" },
  ],
  resources: [
    { name: "Crisis Hotlines", href: "/resources#crisis" },
    { name: "Articles", href: "/resources#articles" },
    { name: "Support Groups", href: "/community" },
    { name: "FAQs", href: "/faq" },
    { name: "Blog", href: "/blog" },
  ],
  about: [
    { name: "Our Mission", href: "/about#mission" },
    { name: "Our Story", href: "/about#story" },
    { name: "Our Team", href: "/about#team" },
    { name: "Impact", href: "/about#impact" },
    { name: "Contact Us", href: "/contact" },
  ],
}

export function Footer({ settings = DEFAULT_SITE_SETTINGS }: FooterProps = {}) {

  const siteName = settings.site_name || "Kennedy Austin Foundation"
  const tagline = settings.site_tagline

  const socialLinks = [
    { name: "Facebook", href: settings.facebook_url, icon: Facebook },
    { name: "Instagram", href: settings.instagram_url, icon: Instagram },
    { name: "Twitter", href: settings.twitter_url, icon: Twitter },
    { name: "YouTube", href: settings.youtube_url, icon: Youtube },
  ].filter((s) => !!s.href)

  const year = new Date().getFullYear()
  const copyright =
    settings.copyright_text || `© ${year} ${siteName}. All rights reserved.`

  return (
    <footer className="bg-slate-50 border-t border-slate-200">
      {settings.newsletter_blurb && (
        <div className="bg-gradient-to-r from-teal-600 to-teal-700">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-white">Stay Connected</h3>
                <p className="text-sm text-white/95">{settings.newsletter_blurb}</p>
              </div>
              <NewsletterForm />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              {settings.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logo_url} alt={siteName} className="h-10 w-auto" />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-700 shadow-warm">
                  <Heart className="h-5 w-5 text-white" />
                </div>
              )}
              <div className="leading-tight">
                <span className="text-lg font-bold text-slate-900 whitespace-nowrap">
                  {siteName}
                </span>
                {tagline && (
                  <span className="block text-xs text-slate-600">{tagline}</span>
                )}
              </div>
            </Link>
            {settings.footer_about && (
              <p className="text-sm text-slate-700 mb-4">{settings.footer_about}</p>
            )}
            <div className="space-y-2 text-sm text-slate-700">
              {settings.primary_phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-teal-700" />
                  <a
                    href={`tel:${settings.primary_phone.replace(/[^0-9+]/g, "")}`}
                    className="hover:text-teal-700 font-medium"
                  >
                    {settings.primary_phone}
                  </a>
                </div>
              )}
              {settings.primary_email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-teal-700" />
                  <a
                    href={`mailto:${settings.primary_email}`}
                    className="hover:text-teal-700"
                  >
                    {settings.primary_email}
                  </a>
                </div>
              )}
              {settings.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-teal-700" />
                  <span>{settings.address}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-900">Services</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-900">Classes</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.classes.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-900">Resources</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold mb-4 text-slate-900">About</h4>
            <ul className="space-y-2 text-sm">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-700 hover:text-teal-700 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-slate-200" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href!}
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 hover:text-teal-700 transition-colors"
              >
                <social.icon className="h-5 w-5" />
                <span className="sr-only">{social.name}</span>
              </a>
            ))}
          </div>

          <div className="text-sm text-slate-600 text-center md:text-right">
            <p>{copyright}</p>
            <div className="flex items-center justify-center md:justify-end gap-4 mt-2">
              <Link href="/privacy" className="hover:text-teal-700">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-teal-700">
                Terms of Service
              </Link>
              <Link href="/accessibility" className="hover:text-teal-700">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
