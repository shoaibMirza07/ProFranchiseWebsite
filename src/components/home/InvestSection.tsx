import { Link } from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'

type StepData = {
  number: string
  label: string
  desc: string
}

type Props = {
  title: string
  subtitle: string
  cta: string
  steps: StepData[]
}

export default function InvestSection({ title, subtitle, cta, steps }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{subtitle}</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-10 left-0 right-0 h-0.5 mx-20 bg-gradient-to-r from-[#0B4D32] to-[#009B91]" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative text-center group">
                {/* Number circle */}
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10 text-white text-xl font-extrabold transition-transform duration-300 group-hover:scale-110"
                  style={{
                    background: `linear-gradient(135deg, #0B4D32 ${i * 25}%, #009B91 100%)`,
                    boxShadow: '0 4px 20px rgba(0,155,145,0.3)',
                  }}
                >
                  {step.number || String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">
                  {step.label}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        {cta && (
          <div className="text-center mt-14">
            <Link href="/contact" className="btn-primary text-base">
              {cta}
              <ArrowRight size={18} />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
