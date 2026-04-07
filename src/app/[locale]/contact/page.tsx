import { getLocale } from 'next-intl/server'
import { prisma } from '@/lib/prisma'
import { getPageSections, getSettings, str, arr } from '@/lib/content'
import ContactForm from '@/components/contact/ContactForm'
import PageHero from '@/components/ui/PageHero'
import { MapPin, Phone, Mail } from 'lucide-react'

type InquiryOption = { value: string; label: string }

export default async function ContactPage() {
  const locale = await getLocale()
  const isAr = locale === 'ar'

  const [sections, settings] = await Promise.all([
    getPageSections('contact', locale),
    getSettings(),
  ])

  const hero = sections['hero'] ?? {}
  const heroTitle    = str(hero, 'title',    isAr ? 'اتصل بنا' : 'Contact Us')
  const heroSubtitle = str(hero, 'subtitle', isAr ? 'لنهندس شيئاً رائعاً معاً.' : "Let's engineer something great together.")

  const inquirySection = sections['inquiry_types'] ?? {}
  const inquiryOptions = arr<InquiryOption>(inquirySection, 'options')

  const addressLabel      = isAr ? 'العنوان'             : 'Address'
  const phoneLabel        = isAr ? 'الهاتف'              : 'Phone'
  const emailLabel        = isAr ? 'البريد الإلكتروني'   : 'Email'
  const getInTouchLabel   = isAr ? 'تواصل معنا'          : 'Get In Touch'
  const sendMessageLabel  = isAr ? 'أرسل لنا رسالة'      : 'Send Us a Message'

  const address = isAr
    ? (settings.address_ar || settings.address_en || '')
    : (settings.address_en || '')
  const tagline = isAr ? settings.footer_tagline_ar : settings.footer_tagline_en

  const rightSection = await prisma.footerSection.findFirst({ where: { position: 'RIGHT' } })
  const contactTitle = isAr
    ? (rightSection?.titleAr || getInTouchLabel)
    : (rightSection?.titleEn || getInTouchLabel)

  return (
    <>
      <PageHero title={heroTitle} subtitle={heroSubtitle} />

      <section className="section-padding bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">{sendMessageLabel}</h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
                <ContactForm inquiryOptions={inquiryOptions} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-8">{contactTitle}</h2>
              <div className="space-y-6">
                {address && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}>
                      <MapPin size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">{addressLabel}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">{address}</p>
                    </div>
                  </div>
                )}
                {settings.phone && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}>
                      <Phone size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">{phoneLabel}</h3>
                      <a href={`tel:${settings.phone}`}
                        className="text-[#009B91] text-sm hover:text-[#0B4D32] transition-colors font-medium">
                        {settings.phone}
                      </a>
                    </div>
                  </div>
                )}
                {settings.email && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}>
                      <Mail size={18} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">{emailLabel}</h3>
                      <a href={`mailto:${settings.email}`}
                        className="text-[#009B91] text-sm hover:text-[#0B4D32] transition-colors font-medium">
                        {settings.email}
                      </a>
                    </div>
                  </div>
                )}
                {tagline && (
                  <div className="mt-8 rounded-2xl p-6"
                    style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}>
                    <p className="text-white/90 text-sm font-medium leading-relaxed">&ldquo;{tagline}&rdquo;</p>
                    <p className="text-white/60 text-xs mt-3">— ProFranchise</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
