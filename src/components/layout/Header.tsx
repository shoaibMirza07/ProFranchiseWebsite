'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useTranslations, useLocale } from 'next-intl'
import { Link, useRouter, usePathname } from '@/lib/navigation'
import { Menu, X, ChevronDown } from 'lucide-react'

type NavItem = {
  id: string
  labelEn: string
  labelAr: string
  href: string
  isActive: boolean
  isExternal: boolean
}

type Settings = Record<string, string>

const FALLBACK_NAV = [
  { id: '1', labelEn: 'Home', labelAr: 'الرئيسية', href: '/', isActive: true, isExternal: false },
  { id: '2', labelEn: 'About', labelAr: 'عنّا', href: '/about', isActive: true, isExternal: false },
  { id: '3', labelEn: 'Our Portfolio', labelAr: 'محفظتنا', href: '/portfolio', isActive: true, isExternal: false },
  { id: '4', labelEn: 'People', labelAr: 'فريقنا', href: '/people', isActive: true, isExternal: false },
  { id: '5', labelEn: 'Contact Us', labelAr: 'اتصل بنا', href: '/contact', isActive: true, isExternal: false },
]

export default function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const isAr = locale === 'ar'

  const [navItems, setNavItems] = useState<NavItem[]>(FALLBACK_NAV)
  const [settings, setSettings] = useState<Settings>({})
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    fetch('/api/nav')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setNavItems(data.filter((i: NavItem) => i.isActive)) })
      .catch(() => {})

    fetch('/api/public/settings')
      .then(r => r.json())
      .then(data => { if (data && typeof data === 'object') setSettings(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toggleLocale() {
    const next = locale === 'en' ? 'ar' : 'en'
    router.replace(pathname, { locale: next })
  }

  return (
    <>
      {/* Accent bar at very top */}
      <div className="fixed top-0 inset-x-0 z-50 h-0.5 bg-gradient-to-r from-[#009B91] via-[#0B4D32] to-[#009B91]" />

      <header
        className="fixed top-0.5 inset-x-0 z-50 transition-all duration-300"
        style={{
          background: scrolled
            ? 'rgba(var(--color-header-rgb, 7, 25, 15), 0.98)'
            : 'rgba(var(--color-header-rgb, 7, 25, 15), 0.82)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: scrolled ? '1px solid rgba(0,155,145,0.25)' : '1px solid rgba(255,255,255,0.08)',
          boxShadow: scrolled ? '0 4px 30px rgba(0,0,0,0.4)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt="ProFranchise"
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-sm"
                    style={{ background: 'linear-gradient(135deg, #009B91, #0B4D32)' }}
                  >
                    PF
                  </div>
                  <span
                    className="text-xl font-extrabold tracking-tight"
                    style={{
                      background: 'linear-gradient(135deg, #fff 0%, #009B91 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    ProFranchise
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map(item => {
                const label = isAr ? item.labelAr : item.labelEn
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.id}
                    href={item.href as '/'}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'text-[#009B91]'
                        : 'text-white/70 hover:text-white hover:bg-white/8'
                    }`}
                  >
                    {label}
                    {isActive && (
                      <span
                        className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full"
                        style={{ background: '#009B91' }}
                      />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-2.5">
              {/* Language switcher */}
              <button
                onClick={toggleLocale}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-white/70 text-xs font-semibold hover:text-[#009B91] transition-colors border border-white/15 hover:border-[#009B91]/50"
              >
                {locale === 'en' ? 'عربي' : 'EN'}
              </button>

              {/* CTA button */}
              <Link
                href="/contact"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #009B91, #0B4D32)',
                  boxShadow: '0 2px 12px rgba(0,155,145,0.35)',
                }}
              >
                {t('cta')}
              </Link>

              {/* Hamburger */}
              <button
                className="lg:hidden text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-colors"
                onClick={() => setMobileOpen(v => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div
              className="lg:hidden border-t pb-4 mt-1"
              style={{ borderColor: 'rgba(0,155,145,0.2)' }}
            >
              <nav className="flex flex-col gap-0.5 pt-2">
                {navItems.map(item => (
                  <Link
                    key={item.id}
                    href={item.href as '/'}
                    onClick={() => setMobileOpen(false)}
                    className="px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/8 hover:text-[#009B91] rounded-lg transition-colors"
                  >
                    {isAr ? item.labelAr : item.labelEn}
                  </Link>
                ))}
              </nav>
              <div className="flex items-center gap-3 px-4 pt-3 border-t mt-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
                <button
                  onClick={toggleLocale}
                  className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs font-semibold hover:border-[#009B91] hover:text-[#009B91] transition-all"
                >
                  {locale === 'en' ? 'عربي' : 'EN'}
                </button>
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center py-2 px-4 rounded-lg text-sm font-semibold text-white"
                  style={{ background: 'linear-gradient(135deg, #009B91, #0B4D32)' }}
                >
                  {t('cta')}
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
