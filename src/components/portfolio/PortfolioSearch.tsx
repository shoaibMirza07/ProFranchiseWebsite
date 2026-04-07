'use client'

import { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { Search } from 'lucide-react'
import BrandCard from './BrandCard'

type Brand = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  logoUrl: string | null
}

type Props = {
  brands: Brand[]
}

export default function PortfolioSearch({ brands }: Props) {
  const locale = useLocale()
  const t = useTranslations('common')
  const [query, setQuery] = useState('')
  const isAr = locale === 'ar'

  const filtered = brands.filter(b => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      b.nameEn.toLowerCase().includes(q) ||
      b.nameAr.toLowerCase().includes(q)
    )
  })

  return (
    <>
      {/* Search bar */}
      <div className="relative max-w-md mb-10">
        <Search
          size={18}
          className="absolute top-1/2 -translate-y-1/2 text-slate-400"
          style={{ insetInlineStart: '14px' }}
        />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder={isAr ? 'ابحث عن علامة تجارية...' : 'Search brands...'}
          className="input-brand"
          style={{ paddingInlineStart: '40px' }}
        />
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          {t('noResults')}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map(brand => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}
    </>
  )
}
