import { getLocale } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getPageSections, str } from '@/lib/content'
import PageHero from '@/components/ui/PageHero'
import JobApplicationForm from '@/components/people/JobApplicationForm'

async function getData() {
  const [gallery, teamMembers] = await Promise.all([
    prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    }),
    (prisma as any).teamMember.findMany({
      where: { displayOnWeb: true, isLeadership: false },
      orderBy: { order: 'asc' },
    }).catch(() =>
      prisma.teamMember.findMany({
        where: { displayOnWeb: true },
        orderBy: { order: 'asc' },
      })
    ),
  ])
  return { gallery, teamMembers }
}

function TestimonialCard({
  member,
  locale,
}: {
  member: any
  locale: string
}) {
  const isAr = locale === 'ar'
  const name = isAr ? member.nameAr : member.nameEn
  const title = isAr ? (member.titleAr ?? member.titleEn) : member.titleEn
  const testimonial = isAr
    ? (member.testimonialAr || member.testimonialEn || '')
    : (member.testimonialEn || member.testimonialAr || '')

  if (!testimonial) return null

  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col gap-4 relative">
      {/* Quote mark */}
      <span
        className="absolute top-4 right-5 text-5xl font-serif leading-none select-none"
        style={{ color: '#009B91', opacity: 0.15 }}
        aria-hidden="true"
      >
        &ldquo;
      </span>

      {/* Testimonial text */}
      <p className="text-slate-600 text-base leading-relaxed italic relative z-10">
        &ldquo;{testimonial}&rdquo;
      </p>

      {/* Employee info */}
      <div className="flex items-center gap-3 mt-auto pt-2 border-t border-slate-50">
        {/* Avatar */}
        <div className="h-12 w-12 rounded-full overflow-hidden flex-shrink-0">
          {member.photoUrl ? (
            <Image
              src={member.photoUrl}
              alt={name}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-white text-sm font-bold"
              style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
            >
              {initials || '?'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-900 text-sm truncate">{name}</p>
          <p className="text-xs text-[#009B91] truncate">{title}</p>
        </div>
        <a
          href="#apply"
          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full border border-[#009B91] text-[#009B91] hover:bg-[#009B91] hover:text-white transition-colors"
        >
          {isAr ? 'انضم إلينا' : 'Join Our Team'}
        </a>
      </div>
    </div>
  )
}

export default async function PeoplePage() {
  const locale = await getLocale()
  const isAr = locale === 'ar'

  const [sections, { gallery, teamMembers }] = await Promise.all([
    getPageSections('people', locale),
    getData(),
  ])

  const heroSection = sections['hero'] ?? {}
  const heroTitle = str(heroSection, 'title')
  const heroSubtitle = str(heroSection, 'subtitle')

  const introSection = sections['intro'] ?? {}
  const introBody = str(introSection, 'body')

  const gallerySection = sections['gallery'] ?? {}
  const galleryTitle = str(gallerySection, 'title')

  const careersSection = sections['careers'] ?? {}
  const careersTitle = str(careersSection, 'title')
  const careersSubtitle = str(careersSection, 'subtitle')

  // Only show testimonials section if at least one member has a testimonial
  const membersWithTestimonials = teamMembers.filter((m: any) => {
    const t = isAr
      ? (m.testimonialAr || m.testimonialEn || '')
      : (m.testimonialEn || m.testimonialAr || '')
    return t.trim().length > 0
  })

  return (
    <>
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      {/* Intro */}
      {introBody && (
        <section className="section-padding bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl text-slate-600 leading-relaxed">
              {introBody}
            </p>
          </div>
        </section>
      )}

      {/* Employee Testimonials */}
      {membersWithTestimonials.length > 0 && (
        <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                {isAr ? 'فريقنا يتحدث' : 'Our People'}
              </h2>
              <p className="text-slate-500 text-sm">
                {isAr
                  ? 'استمع إلى ما يقوله أعضاء فريقنا عن العمل معنا'
                  : 'Hear from the people who make ProFranchise great'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {membersWithTestimonials.map((member: any) => (
                <TestimonialCard key={member.id} member={member} locale={locale} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {gallery.length > 0 && (
        <section className="section-padding bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {galleryTitle && (
              <h2 className="text-3xl font-extrabold text-slate-900 mb-10 text-center">
                {galleryTitle}
              </h2>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {gallery.map((img: any) => {
                const caption = isAr ? img.captionAr : img.captionEn
                return (
                  <div
                    key={img.id}
                    className="relative h-48 rounded-xl overflow-hidden card-hover"
                  >
                    <Image
                      src={img.url}
                      alt={caption}
                      fill
                      className="object-cover"
                    />
                    {caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/40 text-white text-xs p-2 backdrop-blur-sm">
                        {caption}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Job Application */}
      <section id="apply" className="section-padding bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
              {careersTitle}
            </h2>
            <p className="text-slate-500">{careersSubtitle}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
            <JobApplicationForm />
          </div>
        </div>
      </section>
    </>
  )
}
