import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSections, str } from '@/lib/content'
import PageHero from '@/components/ui/PageHero'
import PortfolioSearch from '@/components/portfolio/PortfolioSearch'
import TextBlockSection from '@/components/ui/TextBlockSection'
import CardsSection from '@/components/ui/CardsSection'
import InvestSection from '@/components/ui/InvestSection'
import GallerySection from '@/components/ui/GallerySection'

async function getBrands() {
  return prisma.brand.findMany({
    where: { displayOnWeb: true },
    orderBy: { order: 'asc' },
    select: {
      id: true,
      slug: true,
      nameEn: true,
      nameAr: true,
      logoUrl: true,
    },
  })
}

export default async function PortfolioPage() {
  const locale = await getLocale()

  const [sections, brands] = await Promise.all([
    getPageSections('portfolio', locale),
    getBrands(),
  ])

  const heroSection = sections['hero'] ?? {}
  const heroTitle = str(heroSection, 'title')
  const heroSubtitle = str(heroSection, 'subtitle')

  return (
    <>
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      {/* Grid with search */}
      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioSearch brands={brands} />
        </div>
      </section>

      {/* Generic CMS Sections */}
      {Object.entries(sections).map(([type, content]) => {
        // Skip hero since it's hardcoded at the top
        if (type === 'hero' || type === 'brand_sheet') return null

        switch (type) {
          case 'text-block':
            return <TextBlockSection key={type} content={content} />
          case 'cards':
            return <CardsSection key={type} content={content} locale={locale} />
          case 'invest':
            return <InvestSection key={type} content={content} locale={locale} />
          case 'gallery':
            return <GallerySection key={type} content={content} locale={locale} images={[]} />
          default:
            return null
        }
      })}
    </>
  )
}
