import { getLocale } from 'next-intl/server'
import { Link } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'
import { MapPin, Phone, Mail } from 'lucide-react'

async function getData() {
  const [settings, footerSections] = await Promise.all([
    prisma.setting.findMany().then(rows => {
      const flat: Record<string, string> = {}
      for (const r of rows) flat[r.key] = r.value
      return flat
    }),
    prisma.footerSection.findMany({
      include: { links: { orderBy: { order: 'asc' } } },
    }),
  ])
  return { settings, footerSections }
}

type FooterLink = {
  id: string
  labelEn: string
  labelAr: string
  href: string
  order: number
}

type FooterSection = {
  id: string
  position: string
  titleEn: string | null
  titleAr: string | null
  links: FooterLink[]
}

const QUICK_LINKS = [
  { labelEn: 'Home', labelAr: 'الرئيسية', href: '/' },
  { labelEn: 'About Us', labelAr: 'عنّا', href: '/about' },
  { labelEn: 'Our Portfolio', labelAr: 'محفظتنا', href: '/portfolio' },
  { labelEn: 'People', labelAr: 'فريقنا', href: '/people' },
  { labelEn: 'Contact Us', labelAr: 'اتصل بنا', href: '/contact' },
]

export default async function Footer() {
  const [locale, { settings, footerSections }] = await Promise.all([
    getLocale(),
    getData(),
  ])

  const isAr = locale === 'ar'
  const year = new Date().getFullYear()

  // All text from DB settings — no hardcoded strings
  const tagline = isAr
    ? (settings.footerTaglineAr || settings.taglineAr || '')
    : (settings.footerTaglineEn || settings.taglineEn || '')
  const siteName = isAr
    ? (settings.siteNameAr || 'برو فرانشايز')
    : (settings.siteNameEn || 'ProFranchise')
  const address = isAr
    ? (settings.addressAr || settings.addressEn || '')
    : (settings.addressEn || '')

  const centerSection = footerSections.find((s: FooterSection) => s.position === 'CENTER')
  const rightSection  = footerSections.find((s: FooterSection) => s.position === 'RIGHT')
  const centerLinks = centerSection?.links.length
    ? centerSection.links
    : QUICK_LINKS.map((l, i) => ({ ...l, id: String(i), order: i }))

  return (
    <footer style={{ background: '#0B4D32' }} className="text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          {/* LEFT: Logo + tagline + address */}
          <div className="space-y-5">
            <div>
              {settings.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={settings.logoUrl} alt="ProFranchise" className="h-10 w-auto object-contain mb-4" />
              ) : (
                <span
                  className="text-2xl font-extrabold tracking-tight"
                  style={{
                    background: 'linear-gradient(135deg, #fff 0%, #009B91 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  {siteName}
                </span>
              )}
              {tagline && (
                <p className="mt-3 text-white/70 text-sm leading-relaxed">{tagline}</p>
              )}
            </div>
            {address && (
              <div className="flex gap-2.5 text-sm text-white/60">
                <MapPin size={15} className="shrink-0 mt-0.5 text-[#009B91]" />
                <span>{address}</span>
              </div>
            )}
          </div>

          {/* CENTER: Quick links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#009B91] mb-5">
              {isAr ? (centerSection?.titleAr || 'روابط سريعة') : (centerSection?.titleEn || 'Quick Links')}
            </h3>
            <ul className="space-y-2.5">
              {centerLinks.map((link: FooterLink) => (
                <li key={link.id}>
                  <Link
                    href={link.href as '/'}
                    className="text-sm text-white/70 hover:text-[#009B91] transition-colors"
                  >
                    {isAr ? link.labelAr : link.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: Contact info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-[#009B91] mb-5">
              {isAr ? (rightSection?.titleAr || 'تواصل معنا') : (rightSection?.titleEn || 'Get In Touch')}
            </h3>
            <ul className="space-y-3">
              {settings.phone && (
                <li className="flex gap-2.5 text-sm text-white/70">
                  <Phone size={15} className="shrink-0 mt-0.5 text-[#009B91]" />
                  <a href={`tel:${settings.phone}`} className="hover:text-[#009B91] transition-colors">
                    {settings.phone}
                  </a>
                </li>
              )}
              {settings.email && (
                <li className="flex gap-2.5 text-sm text-white/70">
                  <Mail size={15} className="shrink-0 mt-0.5 text-[#009B91]" />
                  <a href={`mailto:${settings.email}`} className="hover:text-[#009B91] transition-colors">
                    {settings.email}
                  </a>
                </li>
              )}
              {!settings.phone && !settings.email && (
                <li className="text-sm text-white/50">info@profranchise.com</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            &copy; {year} {siteName}. {isAr ? 'جميع الحقوق محفوظة.' : 'All rights reserved.'}
          </p>
          <p className="text-xs text-white/30">
            Engineered for growth.
          </p>
        </div>
      </div>
    </footer>
  )
}
