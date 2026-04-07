import { getLocale } from 'next-intl/server'
import Image from 'next/image'
import { ExternalLink, AtSign } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { getPageSections, str, arr } from '@/lib/content'
import PageHero from '@/components/ui/PageHero'
import ValuesSection from '@/components/about/ValuesSection'

type ValueItem = { icon: string; label: string; desc: string }

async function getData(locale: string) {
  const [sections, partners, leadership] = await Promise.all([
    getPageSections('about', locale),
    prisma.partner.findMany({
      where: { displayOnWeb: true },
      orderBy: { order: 'asc' },
      select: { id: true, nameEn: true, nameAr: true, logoUrl: true },
    }),
    (prisma as any).teamMember.findMany({
      where: { displayOnWeb: true, isLeadership: true },
      orderBy: { order: 'asc' },
    }).catch(() =>
      prisma.teamMember.findMany({
        where: { displayOnWeb: true },
        orderBy: { order: 'asc' },
        select: {
          id: true, nameEn: true, nameAr: true,
          titleEn: true, titleAr: true,
          photoUrl: true, linkedIn: true,
        },
      })
    ),
  ])
  return { sections, partners, leadership }
}

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
      {/* Photo */}
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
        {/* Gradient overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
      </div>

      {/* Info */}
      <div className="p-5">
        <h3 className="font-bold text-slate-900 text-base">{displayName}</h3>
        <p className="text-sm font-medium mt-0.5" style={{ color: '#009B91' }}>{displayTitle}</p>
        {bio && (
          <p className="text-xs text-slate-500 mt-2 leading-relaxed line-clamp-3">{bio}</p>
        )}

        {/* Social links */}
        {(member.linkedIn || xHandle) && (
          <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-50">
            {member.linkedIn && (
              <a
                href={member.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#009B91] transition-colors"
                aria-label={`${displayName} LinkedIn`}
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
                aria-label={`${displayName} X / Twitter`}
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
  const { sections, partners, leadership } = await getData(locale)

  const heroSection = sections['hero'] ?? {}
  const heroTitle = str(heroSection, 'title')
  const heroSubtitle = str(heroSection, 'subtitle')

  const introSection = sections['intro'] ?? {}
  const introTitle = str(introSection, 'title')
  const introBody = str(introSection, 'body')

  const valuesSection = sections['values'] ?? {}
  const valuesTitle = str(valuesSection, 'title')
  const valuesItems = arr<ValueItem>(valuesSection, 'items')

  const teamSection = sections['team'] ?? {}
  const teamTitle = str(teamSection, 'title') || (isAr ? 'فريق القيادة' : 'Leadership Team')
  const teamSubtitle = str(teamSection, 'subtitle')

  const partnersSection = sections['partners'] ?? {}
  const partnersTitle = str(partnersSection, 'title') || (isAr ? 'شركاؤنا الموثوقون' : 'Trusted Partners')
  const partnersSubtitle = str(partnersSection, 'subtitle')

  return (
    <>
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      {/* Introduction */}
      {(introTitle || introBody) && (
        <section className="section-padding bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {introTitle && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-6">
                {introTitle}
              </h2>
            )}
            {introBody && (
              <p className="text-xl text-slate-600 leading-relaxed">
                {introBody}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Values */}
      <ValuesSection title={valuesTitle} items={valuesItems} />

      {/* Leadership Team */}
      {leadership.length > 0 && (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
                {teamTitle}
              </h2>
              {teamSubtitle && (
                <p className="text-slate-500 max-w-xl mx-auto">{teamSubtitle}</p>
              )}
              {/* Decorative accent */}
              <div
                className="mx-auto mt-5 h-1 w-16 rounded-full"
                style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {leadership.map((member: any) => (
                <LeaderCard key={member.id} member={member} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Partners */}
      {partners.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                {partnersTitle}
              </h2>
              {partnersSubtitle && (
                <p className="text-slate-500">{partnersSubtitle}</p>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {partners.map((partner) => {
                const name = isAr ? partner.nameAr : partner.nameEn
                return (
                  <div
                    key={partner.id}
                    className="bg-white rounded-xl border border-slate-100 p-5 flex flex-col items-center justify-center gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                    style={{ minHeight: '110px' }}
                  >
                    {partner.logoUrl ? (
                      <div className="relative w-full h-14">
                        <Image
                          src={partner.logoUrl}
                          alt={name}
                          fill
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
                      >
                        {name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <p className="text-xs text-slate-600 font-medium text-center leading-tight">
                      {name}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
