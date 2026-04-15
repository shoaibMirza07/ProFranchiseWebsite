import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSections, str } from '@/lib/content'
import { Link } from '@/lib/navigation'
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronLeft, MapPin } from 'lucide-react'

type Props = {
  params: Promise<{ slug: string; locale: string }>
}

async function getBrand(slug: string) {
  return prisma.brand.findFirst({
    where: { slug, displayOnWeb: true },
    include: {
      locations: { orderBy: { order: 'asc' } },
      contacts: { include: { contact: true } },
    },
  })
}

export default async function BrandDetailPage({ params }: Props) {
  const { slug } = await params
  const [locale, brand] = await Promise.all([getLocale(), getBrand(slug)])
  if (!brand) return notFound()

  const sections = await getPageSections('portfolio', locale)
  const labels = sections['brand_sheet'] ?? {}

  const isAr = locale === 'ar'
  const name = isAr ? brand.nameAr : brand.nameEn
  const description = isAr ? brand.descriptionAr : brand.descriptionEn
  const netWorth = isAr ? brand.netWorthAr : brand.netWorthEn
  const liquidCapital = isAr ? brand.liquidCapitalAr : brand.liquidCapitalEn
  const experience = isAr ? brand.experienceAr : brand.experienceEn
  const siteProfile = isAr ? brand.siteProfileAr : brand.siteProfileEn

  let whyPoints: string[] = []
  try {
    const raw = isAr ? brand.whyPointsAr : brand.whyPointsEn
    whyPoints = JSON.parse(raw)
  } catch {
    whyPoints = []
  }

  const BackIcon = isAr ? ArrowRight : ArrowLeft

  return (
    <div className="pt-20">
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-[#009B91] transition-colors"
        >
          <BackIcon size={16} />
          {str(labels, 'back', 'Back to Portfolio')}
        </Link>
      </div>

      {/* Brand header */}
      <section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, #0B4D32 0%, #009B91 100%)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center gap-8">
          {brand.logoUrl && (
            <div className="w-28 h-28 rounded-2xl overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
              <Image
                src={brand.logoUrl}
                alt={name}
                width={112}
                height={112}
                className="object-contain p-2"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white">{name}</h1>
            {brand.nameEn !== brand.nameAr && (
              <p className="text-white/60 mt-1">{isAr ? brand.nameEn : brand.nameAr}</p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Introduction */}
        {description && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
              {str(labels, 'intro', 'Introduction')}
            </h2>
            <p className="text-slate-600 leading-relaxed text-lg">{description}</p>
          </section>
        )}

        {/* Minimum Requirements */}
        {(netWorth || liquidCapital || experience || siteProfile) && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
              {str(labels, 'requirements', 'Minimum Requirements')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">{str(labels, 'requirementsSubtitle')}</p>
            <table className="table-brand rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Criteria</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {netWorth && (
                  <tr>
                    <td className="font-medium">{str(labels, 'netWorth', 'Net Worth')}</td>
                    <td>{netWorth}</td>
                  </tr>
                )}
                {liquidCapital && (
                  <tr>
                    <td className="font-medium">{str(labels, 'liquidCapital', 'Liquid Capital')}</td>
                    <td>{liquidCapital}</td>
                  </tr>
                )}
                {experience && (
                  <tr>
                    <td className="font-medium">{str(labels, 'experience', 'Experience')}</td>
                    <td>{experience}</td>
                  </tr>
                )}
                {siteProfile && (
                  <tr>
                    <td className="font-medium">{str(labels, 'siteProfile', 'Site Profile')}</td>
                    <td>{siteProfile}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* Branch Locations */}
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
              {str(labels, 'locations', 'Branch Locations')}
            </h2>
            <p className="text-slate-500 text-sm mb-6">{str(labels, 'locationsSubtitle')}</p>
            <table className="table-brand rounded-xl overflow-hidden">
              <thead>
                <tr>
                  <th>{str(labels, 'city', 'City')}</th>
                  <th>{str(labels, 'area', 'Area')}</th>
                  <th>{str(labels, 'type', 'Type')}</th>
                  <th>{str(labels, 'map', 'Map')}</th>
                </tr>
              </thead>
              <tbody>
                {brand.locations.map(loc => (
                  <tr key={loc.id}>
                    <td className="font-semibold">{isAr ? loc.cityAr : loc.cityEn}</td>
                    <td>{isAr ? loc.areaAr : loc.areaEn}</td>
                    <td>{isAr ? loc.typeAr : loc.typeEn}</td>
                    <td>
                      {(loc as any).googleMapsUrl ? (
                        <a
                          href={(loc as any).googleMapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#009B91] hover:underline font-medium"
                        >
                          <MapPin size={14} />
                          {isAr ? 'عرض الخريطة' : 'View Map'}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

        {/* Why This Brand */}
        {whyPoints.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">
              {str(labels, 'why', 'Why This Brand?')}
            </h2>
            <ul className="space-y-3">
              {whyPoints.map((point, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <CheckCircle2 size={20} className="text-[#009B91] flex-shrink-0 mt-0.5" />
                  <span className="text-slate-700 leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* CTA */}
        <section
          className="rounded-2xl p-10 text-center"
          style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
        >
          <h3 className="text-2xl font-extrabold text-white mb-3">
            Ready to invest in {name}?
          </h3>
          <p className="text-white/75 mb-7">
            Get in touch with our team to start your journey.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-white text-[#0B4D32] font-bold px-8 py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            {str(labels, 'investCta', 'Invest in This Brand')}
            <ChevronLeft size={18} className="rtl:rotate-180" />
          </Link>
        </section>
      </div>
    </div>
  )
}
