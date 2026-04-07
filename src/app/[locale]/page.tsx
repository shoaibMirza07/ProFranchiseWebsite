import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSections, getSettings, str, arr, obj } from '@/lib/content'
import HeroBanner from '@/components/home/HeroBanner'
import IntroSection from '@/components/home/IntroSection'
import EngagementModelSection from '@/components/home/EngagementModelSection'
import OurBrandsSection from '@/components/home/OurBrandsSection'
import StrengthSection from '@/components/home/StrengthSection'

type SlideData = { label: string; title: string }
type CriterionData = { number: string; label: string; desc: string }
type StepData = { number: string; label: string; desc: string }
type PillarData = { label: string; desc: string; imageUrl?: string; diagramUrl?: string }

export default async function HomePage() {
  const locale = await getLocale()

  const [sections, settings, brands] = await Promise.all([
    getPageSections('home', locale),
    getSettings(),
    prisma.brand.findMany({
      where: { displayOnWeb: true },
      orderBy: { order: 'asc' },
      select: { id: true, slug: true, nameEn: true, nameAr: true, logoUrl: true }
    })
  ])

  const heroSection = sections['hero'] ?? {}
  const heroSlides = arr<SlideData>(heroSection, 'slides')
  const heroCta = str(heroSection, 'cta')

  const introSection = sections['intro'] ?? {}
  const introTitle = str(introSection, 'title')
  const introBody = str(introSection, 'body')
  const introSubtext = str(introSection, 'subtext')

  const hexSection = sections['hexagon'] ?? {}
  const hexTitle = str(hexSection, 'title')
  const hexSubtitle = str(hexSection, 'subtitle')
  const hexPillarsRaw = obj(hexSection, 'pillars')
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

  const bsSection = sections['brand_selection'] ?? {}
  const bsTitle = str(bsSection, 'title')
  const bsSubtitle = str(bsSection, 'subtitle')
  const bsCriteria = arr<CriterionData>(bsSection, 'criteria')

  const brandsSection = sections['brands'] ?? {}
  const brandsTitle = str(brandsSection, 'title')
  const brandsSubtitle = str(brandsSection, 'subtitle')
  const brandsCta = str(brandsSection, 'cta')

  const investSection = sections['invest'] ?? {}
  const investTitle = str(investSection, 'title')
  const investSubtitle = str(investSection, 'subtitle')
  const investCta = str(investSection, 'cta')
  const investSteps = arr<StepData>(investSection, 'steps')

  const strengthSection = sections['strength'] ?? {}
  const strengthTitle = str(strengthSection, 'title')
  const strengthSubtitle = str(strengthSection, 'subtitle')

  return (
    <>
      <HeroBanner slides={heroSlides} cta={heroCta} />
      <IntroSection
        title={introTitle}
        body={introBody}
        subtext={introSubtext}
        settings={settings}
        locale={locale}
      />
      <EngagementModelSection
        hexTitle={hexTitle}
        hexSubtitle={hexSubtitle}
        pillars={hexPillars}
        criteriaTitle={bsTitle}
        criteriaSubtitle={bsSubtitle}
        criteria={bsCriteria}
        investTitle={investTitle}
        investSubtitle={investSubtitle}
        investCta={investCta}
        steps={investSteps}
      />
      <OurBrandsSection
        brands={brands}
        title={brandsTitle}
        subtitle={brandsSubtitle}
        cta={brandsCta}
        locale={locale}
      />
      <StrengthSection
        title={strengthTitle}
        subtitle={strengthSubtitle}
        settings={settings}
        locale={locale}
      />
    </>
  )
}
