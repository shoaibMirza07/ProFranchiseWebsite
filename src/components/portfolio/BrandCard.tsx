'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'

type Brand = {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  logoUrl: string | null
}

type Props = {
  brand: Brand
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
      className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold select-none"
      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
    >
      {initials}
    </div>
  )
}

export default function BrandCard({ brand }: Props) {
  const locale = useLocale()
  const t = useTranslations('portfolio')
  const isAr = locale === 'ar'
  const name = isAr ? brand.nameAr : brand.nameEn

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover flex flex-col">
      {/* Logo */}
      <div className="relative h-48 overflow-hidden bg-slate-50">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={name}
            fill
            className="object-contain p-6"
          />
        ) : (
          <BrandInitials name={name} />
        )}
      </div>

      {/* Info */}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-bold text-slate-900 text-lg mb-1">{name}</h3>
        {brand.nameEn !== brand.nameAr && (
          <p className="text-sm text-slate-400 mb-3">
            {isAr ? brand.nameEn : brand.nameAr}
          </p>
        )}
        <div className="mt-auto pt-4">
          <Link
            href={`/portfolio/${brand.slug}` as '/'}
            className="btn-outline w-full justify-center text-sm"
          >
            {t('viewBrand')}
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}
