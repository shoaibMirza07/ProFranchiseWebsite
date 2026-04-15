import { getLocale } from 'next-intl/server'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getPageSectionsOrdered, str, arr, SectionContent } from '@/lib/content'
import PageHero from '@/components/ui/PageHero'
import JobApplicationForm from '@/components/people/JobApplicationForm'
import TeamGrid from '@/components/people/TeamGrid'
import CardsSection from '@/components/ui/CardsSection'

async function getTeamMembers() {
  try {
    const team = await prisma.teamMember.findMany({
      where: { displayOnWeb: true },
      orderBy: { order: 'asc' },
    })
    return team
  } catch {
    return []
  }
}

async function getGallery() {
  try {
    return await prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    })
  } catch {
    return []
  }
}

export default async function PeoplePage() {
  const locale = await getLocale()
  const isAr = locale === 'ar'

  const [sections, teamMembers, galleryImages] = await Promise.all([
    getPageSectionsOrdered('people', locale),
    getTeamMembers(),
    getGallery()
  ])

  return (
    <>
      <main>
        {sections.map((section) => {
          const { type, content, id } = section

          switch (type) {
            case 'hero':
              return (
                <PageHero
                  key={id}
                  title={str(content, 'title') || (isAr ? 'فريقنا' : 'Our People')}
                  subtitle={str(content, 'subtitle')}
                  imageUrl={str(content, 'imageUrl')}
                />
              )

            case 'intro': {
              const body = str(content, 'body')
              if (!body) return null
              return (
                <section key={id} className="section-padding bg-white relative overflow-hidden">
                  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <p className="text-xl lg:text-2xl text-slate-600 leading-relaxed font-medium">
                      {body}
                    </p>
                  </div>
                </section>
              )
            }

            case 'cards':
              return <CardsSection key={id} content={content} locale={locale} />

            case 'gallery':
              if (galleryImages.length === 0) return null
              return (
                <section key={id} className="section-padding bg-white">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-extrabold text-slate-900 mb-3">
                        {str(content, 'title') || (isAr ? 'الحياة في برو فرانشايز' : 'Life at ProFranchise')}
                      </h2>
                      <div className="mx-auto mt-4 h-1 w-16 rounded-full" style={{ background: '#009B91' }} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {galleryImages.map((img: any) => {
                        const caption = isAr ? img.captionAr : img.captionEn
                        return (
                          <div
                            key={img.id}
                            className="relative h-64 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
                          >
                            <Image
                              src={img.url}
                              alt={caption || ''}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {caption && (
                              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white text-xs p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                {caption}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </section>
              )

            case 'team':
              return (
                <TeamGrid
                  key={id}
                  members={teamMembers}
                  locale={locale}
                  title={str(content, 'title')}
                  subtitle={str(content, 'subtitle')}
                />
              )

            case 'careers':
              return (
                <section key={id} id="apply" className="section-padding bg-white">
                  <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        {str(content, 'title') || (isAr ? 'انضم إلى فريقنا' : 'Join Our Team')}
                      </h2>
                      <p className="text-lg text-slate-500 max-w-xl mx-auto">
                        {str(content, 'subtitle') || (isAr ? 'نحن نبحث دائماً عن المواهب التي تبني الإرث.' : "We're always looking for talent that builds legacies.")}
                      </p>
                    </div>
                    <div className="bg-white rounded-3xl border border-slate-100 p-8 lg:p-12 shadow-2xl shadow-slate-200/50">
                      <JobApplicationForm />
                    </div>
                  </div>
                </section>
              )

            default:
              return null
          }
        })}
      </main>
    </>
  )
}
