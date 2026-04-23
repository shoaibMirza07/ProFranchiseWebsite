'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import CtaGroup, { CtaItem } from '@/components/ui/CtaGroup'

type Settings = Record<string, string>

function useAnimatedCounter(target: number, active: boolean, duration = 1800) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) return
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [active, target, duration])
  return count
}

type StatProps = {
  value: number
  suffix: string
  label: string
  active: boolean
}

function Stat({ value, suffix, label, active }: StatProps) {
  const count = useAnimatedCounter(value, active)
  return (
    <div className="text-start">
      <div
        className="text-5xl lg:text-6xl font-black"
        style={{
          background: 'linear-gradient(135deg, #0B4D32, #009B91)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {count}{suffix}
      </div>
      <div className="text-sm text-slate-500 font-medium mt-1">{label}</div>
    </div>
  )
}

type Props = {
  title: string
  body: string
  subtext: string
  ctas?: CtaItem[]
  settings: Settings
  locale: string
}

export default function IntroSection({ title, body, subtext, ctas, settings, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const isAr = locale === 'ar'

  // Stats use the same keys as the Settings admin (stat1Number, stat1LabelEn, stat1LabelAr etc.)
  const statBrands   = parseInt(settings.stat1Number   ?? '50')
  const statYears    = parseInt(settings.stat2Number   ?? '15')
  const statCountries = parseInt(settings.stat3Number  ?? '3')

  const brandsLabel    = isAr ? (settings.stat1LabelAr ?? 'Brands')    : (settings.stat1LabelEn ?? 'Brands')
  const yearsLabel     = isAr ? (settings.stat2LabelAr ?? 'Years')     : (settings.stat2LabelEn ?? 'Years')
  const countriesLabel = isAr ? (settings.stat3LabelAr ?? 'Countries') : (settings.stat3LabelEn ?? 'Countries')

  return (
    <section
      className="section-padding"
      style={{ background: 'linear-gradient(160deg, #ffffff 0%, #f0fffe 100%)' }}
      ref={ref}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left: title + body with teal accent line */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            {/* Teal accent line */}
            <div
              className="absolute left-0 top-1 bottom-1 w-1 rounded-full hidden lg:block"
              style={{ background: 'linear-gradient(180deg, #009B91, #0B4D32)' }}
            />
            <div className="lg:ps-6">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight mb-5">
                {title}
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                {body}
              </p>
              {subtext && (
                <p className="text-slate-400 text-sm leading-relaxed italic border-s-2 border-teal-200 ps-4 mb-6">
                  {subtext}
                </p>
              )}
              <CtaGroup ctas={ctas} />
            </div>
          </motion.div>

          {/* Right: stats */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: statBrands, suffix: '+', label: brandsLabel },
                { value: statYears, suffix: '+', label: yearsLabel },
                { value: statCountries, suffix: '', label: countriesLabel },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="text-start rounded-2xl p-5 border border-slate-100 bg-white shadow-sm"
                  style={{ boxShadow: '0 4px 24px rgba(0,155,145,0.07)' }}
                >
                  <Stat value={stat.value} suffix={stat.suffix} label={stat.label} active={inView} />
                </div>
              ))}
            </div>

            {/* Decorative teal bar */}
            <div
              className="h-1.5 w-28 rounded-full"
              style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
