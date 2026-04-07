import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

type TeamMember = {
  id: string
  nameEn: string
  nameAr: string
  titleEn: string
  titleAr: string
  photoUrl: string | null
  linkedIn: string | null
}

type Props = {
  title: string
  subtitle: string
  team: TeamMember[]
  locale: string
}

function AvatarPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className="w-full h-full flex items-center justify-center text-white text-2xl font-extrabold"
      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
    >
      {initials}
    </div>
  )
}

export default function TeamSection({ title, subtitle, team, locale }: Props) {
  const isAr = locale === 'ar'

  if (!team.length) return null

  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {team.map(member => {
            const displayName = isAr ? member.nameAr : member.nameEn
            const displayTitle = isAr ? member.titleAr : member.titleEn
            return (
              <div
                key={member.id}
                className="group bg-white rounded-2xl overflow-hidden border border-slate-100 card-hover"
              >
                {/* Photo */}
                <div className="relative h-52 overflow-hidden">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={displayName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <AvatarPlaceholder name={displayName} />
                  )}
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-bold text-slate-900">{displayName}</h3>
                  <p className="text-sm text-[#009B91] font-medium mt-0.5">{displayTitle}</p>
                  {member.linkedIn && (
                    <a
                      href={member.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs text-slate-400 hover:text-[#009B91] transition-colors"
                    >
                      <ExternalLink size={14} />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
