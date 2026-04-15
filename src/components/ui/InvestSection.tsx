'use client'

import { motion } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'
import { SectionContent, str, arr } from '@/lib/content'

type StepData = { number: string; label: string; desc: string }

export default function InvestSection({ content, locale }: { content: SectionContent; locale: string }) {
  const isAr = locale === 'ar'
  const title = str(content, 'title')
  const subtitle = str(content, 'subtitle')
  const cta = str(content, 'cta')
  const steps = arr<StepData>(content, 'steps')

  if (steps.length === 0 && !title) return null

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          {title && (
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {title}
            </h2>
          )}
          {subtitle && (
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          )}
          <div className="mx-auto mt-6 h-1 w-20 rounded-full" style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }} />
        </div>

        <div className="relative">
          {/* Desktop connecting dashed line */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-px mx-16 border-t-2 border-dashed border-slate-200 z-0" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="relative text-center group z-10"
              >
                {/* Number circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10 text-white text-2xl font-extrabold transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, #0B4D32 ${i * 25}%, #009B91 100%)`,
                    boxShadow: '0 6px 24px rgba(0,155,145,0.25)',
                  }}
                >
                  {step.number || String(i + 1).padStart(2, '0')}
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-3">
                  {step.label}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {cta && (
          <div className="text-center mt-16">
            <Link href="/contact" className="btn-primary text-base">
              {cta}
              <ArrowRight size={18} className={isAr ? 'rotate-180 ml-0 mr-2' : 'ml-2'} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
