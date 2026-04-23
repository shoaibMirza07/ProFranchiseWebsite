import { getLocale } from 'next-intl/server'
import Image from 'next/image'
import { ExternalLink, AtSign } from 'lucide-react'
import { Link } from '@/lib/navigation'
import { prisma } from '@/lib/prisma'
import { getPageSectionsOrdered, str, arr, SectionContent } from '@/lib/content'
import PageHero from '@/components/ui/PageHero'
import TextBlockSection from '@/components/ui/TextBlockSection'
import ValuesSection from '@/components/about/ValuesSection'
import CardsSection from '@/components/ui/CardsSection'
import GallerySection from '@/components/ui/GallerySection'
import InvestSection from '@/components/ui/InvestSection'

type ValueItem = { icon: string; label: string; desc: string }

function LeaderCard({ member, locale }: { member: any; locale: string }) {
  const isAr = locale === 'ar'
  const displayName = isAr ? member.nameAr : member.nameEn
  const displayTitle = isAr ? (member.titleAr ?? member.titleEn) : member.titleEn
  const bio = isAr ? (member.bioAr ?? member.bioEn ?? '') : (member.bioEn ?? member.bioAr ?? '')
  const xHandle = (member as any).xHandle ?? ''

  const initials = displayName
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div
      className="group bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ boxShadow: '0 2px 12px rgba(11,77,50,0.06)' }}
    >
      <div className="relative h-56 overflow-hidden">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={displayName}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-white text-3xl font-extrabold"
            style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
          >
            {initials}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#009B91' }}>{displayTitle}</p>
        {bio && (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{bio}</p>
        )}

        {(member.linkedIn || xHandle) && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50">
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#009B91] transition-colors"
              >
                <ExternalLink size={14} />
                <span>LinkedIn</span>
              </a>
            )}
            {xHandle && (
              <a
                href={`https://x.com/${xHandle.replace(/^@/, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#009B91] transition-colors"
              >
                <AtSign size={14} />
                <span>{xHandle.startsWith('@') ? xHandle : `@${xHandle}`}</span>
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default async function AboutPage() {
  const locale = await getLocale()
  const isAr = locale === 'ar'

  const [sections, partners, leadership, galleryImages] = await Promise.all([
    getPageSectionsOrdered('about', locale),
    prisma.partner.findMany({
      where: { displayOnWeb: true },
      orderBy: { order: 'asc' },
    }),
    (prisma as any).teamMember.findMany({
      where: { displayOnWeb: true, isLeadership: true },
      orderBy: { order: 'asc' },
    }).catch(() =>
      prisma.teamMember.findMany({
        where: { displayOnWeb: true },
        orderBy: { order: 'asc' },
      })
    ),
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  ])

  return (
    <main>
      {sections.map((section) => {
        const { id, type, content } = section

        switch (type) {
          case 'hero':
            return (
              <PageHero
                key={id}
                title={str(content, 'title')}
                subtitle={str(content, 'subtitle')}
                imageUrl={str(content, 'imageUrl')}
              />
            )

          case 'intro': {
            const title = str(content, 'title')
            const subtitle = str(content, 'subtitle')
            const body = str(content, 'body')
            const subtext = str(content, 'subtext')
            const cta = str(content, 'cta')
            const ctaUrl = str(content, 'ctaUrl') || '/contact'
            const imageUrl = str(content, 'imageUrl')

            if (!title && !body && !imageUrl) return null

            return (
              <section key={id} className="section-padding bg-white">
                <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${imageUrl ? 'grid grid-cols-1 lg:grid-cols-2 gap-12 items-center' : 'text-center max-w-4xl'}`}>
                  <div className={!imageUrl ? "mx-auto" : ""}>
                    {subtitle && <h3 className={`text-sm font-bold uppercase tracking-wider text-[#009B91] mb-3 ${!imageUrl ? 'mx-auto' : ''}`}>{subtitle}</h3>}
                    {title && <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">{title}</h2>}
                    {body && <p className="text-xl text-slate-600 leading-relaxed mb-6">{body}</p>}
                    {subtext && <p className="text-sm text-slate-400 italic mb-8 border-l-2 border-[#009B91]/30 pl-4">{subtext}</p>}
                    {cta && (
                      <Link href={ctaUrl} className="inline-flex items-center justify-center px-8 py-3.5 text-sm font-bold text-white transition-colors bg-[#009B91] rounded-lg hover:bg-[#0B4D32]">
                        {cta}
                      </Link>
                    )}
                  </div>
                  {imageUrl && (
                    <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden shadow-xl border border-slate-100">
                      <Image src={imageUrl} alt={title || 'About Section'} fill className="object-cover" />
                    </div>
                  )}
                </div>
              </section>
            )
          }

          case 'text-block':
            return <TextBlockSection key={id} content={content} />

          case 'values':
            return <ValuesSection key={id} title={str(content, 'title')} items={arr<ValueItem>(content, 'items')} />

          case 'team':
            if (leadership.length === 0) return null
            return (
              <section key={id} className="section-padding bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-12">
                    <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                      {str(content, 'title') || (isAr ? 'فريق القيادة' : 'Leadership Team')}
                    </h2>
                    {str(content, 'subtitle') && <p className="text-slate-500 max-w-xl mx-auto">{str(content, 'subtitle')}</p>}
                    <div className="mx-auto mt-5 h-1 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {leadership.map((member: any) => (
                      <LeaderCard key={member.id} member={member} locale={locale} />
                    ))}
                  </div>
                </div>
              </section>
            )

          case 'partners':
            if (partners.length === 0) return null
            return (
              <section key={id} className="section-padding" style={{ background: 'var(--color-muted)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                      {str(content, 'title') || (isAr ? 'شركاؤنا الموثوقون' : 'Trusted Partners')}
                    </h2>
                    {str(content, 'subtitle') && <p className="text-slate-500">{str(content, 'subtitle')}</p>}
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {partners.map((partner) => {
                      const name = isAr ? partner.nameAr : partner.nameEn
                      const desc = isAr ? (partner.descriptionAr || partner.descriptionEn) : (partner.descriptionEn || partner.descriptionAr)
                      const isClickable = !!(partner as any).websiteUrl || !!desc
                      
                      const CardContent = (
                        <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center gap-4 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 h-full group">
                          {partner.logoUrl ? (
                            <div className="relative w-full h-16 transition-transform duration-300 group-hover:scale-110">
                              <Image src={partner.logoUrl} alt={name} fill className="object-contain" />
                            </div>
                          ) : (
                            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}>
                              {name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-800 leading-tight group-hover:text-[#009B91] transition-colors">{name}</p>
                            {desc && <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">{desc}</p>}
                          </div>
                          {(partner as any).websiteUrl && (
                            <div className="mt-auto pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <ExternalLink size={14} className="text-[#009B91]" />
                            </div>
                          )}
                        </div>
                      )

                      if ((partner as any).websiteUrl) {
                        return <a key={partner.id} href={(partner as any).websiteUrl} target="_blank" rel="noopener noreferrer">{CardContent}</a>
                      }
                      return <div key={partner.id}>{CardContent}</div>
                    })}
                  </div>
                </div>
              </section>
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
