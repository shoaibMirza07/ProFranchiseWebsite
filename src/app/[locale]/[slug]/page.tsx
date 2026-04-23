import { notFound } from 'next/navigation'
import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSectionsOrdered, getSettings, str, arr, getCtas, obj } from '@/lib/content'

import HeroBanner from '@/components/home/HeroBanner'
import IntroSection from '@/components/home/IntroSection'
import TextBlockSection from '@/components/ui/TextBlockSection'
import CardsSection from '@/components/ui/CardsSection'
import InvestSection from '@/components/ui/InvestSection'
import GallerySection from '@/components/ui/GallerySection'
import OurBrandsSection from '@/components/home/OurBrandsSection'
import StrengthSection from '@/components/home/StrengthSection'
import { FrameworkTab } from '@/components/home/EngagementModelSection'

export default async function DynamicCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const locale = await getLocale()

  // Prevent routing conflicts with hardcoded folders or API
  if (['admin', 'api', 'about', 'contact', 'people', 'portfolio'].includes(slug)) {
    return notFound()
  }

  const [sections, settings, brands, galleryImages] = await Promise.all([
    getPageSectionsOrdered(slug, locale),
    getSettings(),
    prisma.brand.findMany({
      where: { displayOnWeb: true },
      orderBy: { order: 'asc' },
      select: { id: true, slug: true, nameEn: true, nameAr: true, logoUrl: true }
    }),
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  ])

  // If no sections found, it means the page doesn't exist or is empty
  if (!sections || sections.length === 0) {
    return notFound()
  }

  return (
    <main>
      {sections.map((section) => {
        const { id, type, content } = section

        switch (type) {
          case 'hero':
            const slides = arr<any>(content, 'slides').map((s: any) => ({
              ...s,
              ctas: getCtas(s, 'ctas')
            }))
            return <HeroBanner key={id} slides={slides} ctas={getCtas(content, 'ctas')} bgUrl={str(content, 'imageUrl')} />

          case 'intro':
            return (
              <IntroSection
                key={id}
                title={str(content, 'title')}
                body={str(content, 'body')}
                subtext={str(content, 'subtext')}
                ctas={getCtas(content, 'ctas')}
                settings={settings}
                locale={locale}
              />
            )

          case 'text-block':
            return <TextBlockSection key={id} content={content} />

          case 'brands':
            return (
              <OurBrandsSection
                key={id}
                brands={brands}
                title={str(content, 'title')}
                subtitle={str(content, 'subtitle')}
                ctas={getCtas(content, 'ctas')}
                locale={locale}
              />
            )

          case 'strength':
            return (
              <StrengthSection
                key={id}
                title={str(content, 'title')}
                subtitle={str(content, 'subtitle')}
                settings={settings}
                locale={locale}
              />
            )

          case 'cards':
            return <CardsSection key={id} content={content} locale={locale} />

          case 'invest':
            return <InvestSection key={id} content={content} locale={locale} />

          case 'gallery':
            return <GallerySection key={id} content={content} locale={locale} images={galleryImages as any} />

          case 'hexagon':
            const hexPillarsRaw = obj(content, 'pillars')
            const hexPillars: Record<string, any> = {}
            for (const key of ['brand', 'operator', 'consumer', 'employees', 'supplyChain', 'technology']) {
              const p = hexPillarsRaw[key]
              if (p && typeof p === 'object' && !Array.isArray(p)) {
                const po = p as any
                hexPillars[key] = {
                  label: typeof po.label === 'string' ? po.label : '',
                  desc: typeof po.desc === 'string' ? po.desc : '',
                  imageUrl: typeof po.imageUrl === 'string' ? po.imageUrl : undefined,
                  diagramUrl: typeof po.diagramUrl === 'string' ? po.diagramUrl : undefined,
                }
              } else {
                hexPillars[key] = { label: '', desc: '' }
              }
            }
            return (
              <section key={id} className="section-padding bg-slate-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    {str(content, 'title') && (
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">{str(content, 'title')}</h2>
                    )}
                    {str(content, 'subtitle') && (
                      <p className="text-slate-500 max-w-xl mx-auto">{str(content, 'subtitle')}</p>
                    )}
                  </div>
                  <FrameworkTab pillars={hexPillars} />
                </div>
              </section>
            )

          default:
            return null
        }
      })}
    </main>
  )
}
