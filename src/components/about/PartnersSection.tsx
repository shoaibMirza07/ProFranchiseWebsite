import Image from 'next/image'

type Partner = {
  id: string
  nameEn: string
  nameAr: string
  logoUrl: string | null
}

type Props = {
  title: string
  subtitle: string
  partners: Partner[]
  locale: string
}

export default function PartnersSection({ title, subtitle, partners, locale }: Props) {
  const isAr = locale === 'ar'

  if (!partners.length) return null

  return (
    <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-slate-500">{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {partners.map(partner => {
            const displayName = isAr ? partner.nameAr : partner.nameEn
            return (
              <div
                key={partner.id}
                className="group bg-white rounded-xl p-4 border border-slate-100 flex items-center justify-center h-24 card-hover"
              >
                {partner.logoUrl ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={partner.logoUrl}
                      alt={displayName}
                      fill
                      className="object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300 p-2"
                    />
                  </div>
                ) : (
                  <span className="text-xs font-semibold text-slate-400 group-hover:text-[#009B91] transition-colors text-center">
                    {displayName}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
