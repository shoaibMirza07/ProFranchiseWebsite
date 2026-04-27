'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Link } from '@/lib/navigation'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import CtaGroup, { CtaItem } from '@/components/ui/CtaGroup'

type Brand = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  logoUrl: string | null
}

type Props = {
  brands: Brand[]
  title: string
  subtitle: string
  ctas?: CtaItem[]
  locale: string
}

function BrandInitials({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-2xl font-extrabold select-none"
      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
    >
      {initials}
    </div>
  )
}

export default function OurBrandsSection({ brands, title, subtitle, ctas, locale }: Props) {
  const isAr = locale === 'ar'
  const trackRef = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  function updateButtons() {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateButtons, { passive: true })
    updateButtons()
    return () => el.removeEventListener('scroll', updateButtons)
  }, [brands])

  function scroll(dir: 'left' | 'right') {
    const el = trackRef.current
    if (!el) return
    const amount = 320
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
  }

  if (!brands.length) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-2">
              {title}
            </h2>
            <p className="text-slate-500">{subtitle}</p>
          </div>
          <div className="hidden sm:block">
            <CtaGroup ctas={ctas} align={isAr ? 'start' : 'end'} />
          </div>
        </div>

        {/* Carousel */}
        <div className="relative">
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto scroll-smooth pb-2"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {brands.map((brand, i) => {
              const displayName = isAr ? brand.nameAr : brand.nameEn
              return (
                <motion.div
                  key={brand.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="shrink-0 w-64"
                >
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover h-full flex flex-col">
                    {/* Logo area */}
                    <div className="relative h-44 bg-slate-50 overflow-hidden">
                      {brand.logoUrl ? (
                        <Image
                          src={brand.logoUrl}
                          alt={displayName}
                          fill
                          className="object-contain p-4"
                        />
                      ) : (
                        <BrandInitials name={displayName} />
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 mb-1">
                        {displayName}
                      </h3>
                      <div className="mt-auto pt-3">
                        <Link
                          href={`/portfolio/${brand.slug}` as '/'}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#009B91] hover:text-[#0B4D32] transition-colors"
                        >
                          {ctas?.[0]?.text || 'Learn More'}
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Arrow buttons */}
          {canPrev && (
            <button
              onClick={() => scroll('left')}
              className="absolute -left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:text-[#009B91] transition-colors z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          {canNext && (
            <button
              onClick={() => scroll('right')}
              className="absolute -right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg border border-slate-100 flex items-center justify-center text-slate-700 hover:text-[#009B91] transition-colors z-10"
              aria-label="Scroll right"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 sm:hidden">
          <CtaGroup ctas={ctas} align="center" />
        </div>
      </div>
    </section>
  )
}
