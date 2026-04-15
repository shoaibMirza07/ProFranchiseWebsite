import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSectionsOrdered, getSettings, str, arr, obj, SectionContent } from '@/lib/content'
import HeroBanner from '@/components/home/HeroBanner'
import IntroSection from '@/components/home/IntroSection'
import EngagementModelSection from '@/components/home/EngagementModelSection'
import OurBrandsSection from '@/components/home/OurBrandsSection'
import StrengthSection from '@/components/home/StrengthSection'
import GallerySection from '@/components/ui/GallerySection'
import CardsSection from '@/components/ui/CardsSection'
import TextBlockSection from '@/components/ui/TextBlockSection'
import InvestSection from '@/components/ui/InvestSection'

type PillarData = { label: string; desc: string; imageUrl?: string; diagramUrl?: string }
type SlideData = { label: string; title: string; imageUrl?: string; ctaText?: string; ctaUrl?: string; subtitle?: string; titleSize?: string }
type CriterionData = { number: string; label: string; desc: string }
type StepData = { number: string; label: string; desc: string }

export default async function HomePage() {
  const locale = await getLocale()

  const [sections, settings, brands, galleryImages] = await Promise.all([
    getPageSectionsOrdered('home', locale),
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

  // Helper to find data for Engagement Model tabs
  const findContent = (type: string) => sections.find(s => s.type === type)?.content ?? {}
  
  const hexagonContent = findContent('hexagon')
  const selectionContent = findContent('brand_selection')
  const investContent = findContent('invest')

  const hexPillarsRaw = obj(hexagonContent, 'pillars')
  const hexPillars: Record<string, PillarData> = {}
  for (const key of ['brand', 'operator', 'consumer', 'employees', 'supplyChain', 'technology']) {
    const p = hexPillarsRaw[key]
    if (p && typeof p === 'object' && !Array.isArray(p)) {
      const po = p as Record<string, unknown>
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

  // Track if we've already rendered the tabbed Engagement Model
  let renderedEngagementModel = false

  // Find the exact IDs of the sections that feed the engagement model so we don't accidentally double-render them.
  const engagementSectionIds = new Set([
    sections.find(s => s.type === 'hexagon')?.id,
    sections.find(s => s.type === 'brand_selection')?.id,
    sections.find(s => s.type === 'invest')?.id,
  ])

  return (
    <main>
      {sections.map((section) => {
        const { id, type, content } = section

        // The Engagement grouping reads content directly from the specific IDs
        if (engagementSectionIds.has(id)) {
          if (renderedEngagementModel) return null
          renderedEngagementModel = true
          return (
            <EngagementModelSection
              key="engagement-model-tabs"
              hexTitle={str(hexagonContent, 'title')}
              hexSubtitle={str(hexagonContent, 'subtitle')}
              pillars={hexPillars}
              criteriaTitle={str(selectionContent, 'title')}
              criteriaSubtitle={str(selectionContent, 'subtitle')}
              criteria={arr<CriterionData>(selectionContent, 'criteria')}
              investTitle={str(investContent, 'title')}
              investSubtitle={str(investContent, 'subtitle')}
              investCta={str(investContent, 'cta')}
              steps={arr<StepData>(investContent, 'steps')}
            />
          )
        }

        switch (type) {
          case 'hero':
            return <HeroBanner key={id} slides={arr<SlideData>(content, 'slides')} cta={str(content, 'cta')} bgUrl={str(content, 'imageUrl')} />

          case 'intro':
            return (
              <IntroSection
                key={id}
                title={str(content, 'title')}
                body={str(content, 'body')}
                subtext={str(content, 'subtext')}
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
                cta={str(content, 'cta')}
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

          default:
            return null
        }
      })}
    </main>
  )
}
