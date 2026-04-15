'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ExternalLink, AtSign } from 'lucide-react'

interface TeamMember {
  id: string
  nameEn: string
  nameAr: string
  titleEn: string
  titleAr: string
  photoUrl?: string | null
  bioEn?: string | null
  bioAr?: string | null
  linkedIn?: string | null
  xHandle?: string | null
}

export default function TeamGrid({
  members,
  locale,
  title,
  subtitle
}: {
  members: TeamMember[]
  locale: string
  title?: string
  subtitle?: string
}) {
  const isAr = locale === 'ar'

  if (members.length === 0) return null

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {title || (isAr ? 'فريقنا' : 'Our People')}
          </h2>
          {subtitle && (
            <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          )}
          <div className="mx-auto mt-6 h-1 w-20 rounded-full" style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {members.map((member, idx) => {
            const name = isAr ? member.nameAr : member.nameEn
            const role = isAr ? (member.titleAr ?? member.titleEn) : member.titleEn
            const bio = isAr ? (member.bioAr ?? member.bioEn) : (member.bioEn ?? member.bioAr)
            const initials = name
              .split(' ')
              .slice(0, 2)
              .map((w: string) => w[0]?.toUpperCase() ?? '')
              .join('')

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1, duration: 0.5 }}
                className="group relative"
              >
                {/* Visual Card */}
                <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-slate-100 shadow-sm transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-[#009B91]/10 group-hover:-translate-y-2">
                  {member.photoUrl ? (
                    <Image
                      src={member.photoUrl}
                      alt={name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white text-5xl font-black opacity-90"
                      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
                    >
                      {initials}
                    </div>
                  )}
                  
                  {/* Glass Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent opacity-80" />
                  
                  {/* Info Overlay (Inside Photo) */}
                  <div className="absolute bottom-0 inset-x-0 p-8 text-white">
                    <h3 className="text-2xl font-bold mb-1 leading-tight">{name}</h3>
                    <p className="text-[#009B91] font-semibold text-sm tracking-wide uppercase">{role}</p>
                    
                    {/* Expandable Bio - Simple reveal on hover */}
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-500 opacity-0 group-hover:opacity-100 pt-4">
                      {bio && (
                        <p className="text-white/80 text-xs leading-relaxed line-clamp-3 italic">
                          "{bio}"
                        </p>
                      )}
                      
                      {/* Socials */}
                      <div className="flex gap-4 mt-4">
                        {member.linkedIn && (
                          <a href={member.linkedIn} target="_blank" className="text-white/60 hover:text-[#009B91] transition-colors">
                            <ExternalLink size={18} />
                          </a>
                        )}
                        {member.xHandle && (
                          <a href={`https://x.com/${member.xHandle}`} target="_blank" className="text-white/60 hover:text-[#009B91] transition-colors">
                            <AtSign size={18} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
