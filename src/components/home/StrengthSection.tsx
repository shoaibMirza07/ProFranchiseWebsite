'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'

type Settings = Record<string, string>

type StrengthMetric = {
  number: string
  label: string
}

function getStrengths(settings: Settings, locale: string): StrengthMetric[] {
  const isAr = locale === 'ar'
  const defaults: StrengthMetric[] = [
    { number: '50+', label: 'Franchise Brands' },
    { number: '200+', label: 'Locations Managed' },
    { number: '15+', label: 'Years of Expertise' },
    { number: '3', label: 'Countries of Operation' },
  ]

  return Array.from({ length: 4 }, (_, i) => {
    const n = i + 1
    // Settings admin saves as stat1Number, stat1LabelEn, stat1LabelAr
    const labelKey = isAr ? `stat${n}LabelAr` : `stat${n}LabelEn`
    return {
      number: settings[`stat${n}Number`] ?? defaults[i].number,
      label: settings[labelKey] ?? defaults[i].label,
    }
  })
}

function useAnimatedCounter(target: string, active: boolean) {
  const [displayed, setDisplayed] = useState('0')

  useEffect(() => {
    if (!active) return
    const numeric = parseFloat(target.replace(/[^0-9.]/g, ''))
    const suffix = target.replace(/[0-9.]/g, '')
    if (isNaN(numeric)) {
      setDisplayed(target)
      return
    }
    let current = 0
    const steps = 60
    const increment = numeric / steps
    const timer = setInterval(() => {
      current += increment
      if (current >= numeric) {
        setDisplayed(target)
        clearInterval(timer)
      } else {
        setDisplayed(String(Math.floor(current)) + suffix)
      }
    }, 20)
    return () => clearInterval(timer)
  }, [active, target])

  return displayed
}

function MetricCard({ metric, active, index }: { metric: StrengthMetric; active: boolean; index: number }) {
  const count = useAnimatedCounter(metric.number, active)
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={active ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12 }}
      className="relative text-center py-10 px-6 group overflow-hidden"
    >
      {/* Subtle teal glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 50%, rgba(0,155,145,0.12) 0%, transparent 70%)' }}
      />

      {/* Large decorative number watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center text-8xl font-black select-none pointer-events-none"
        style={{ color: 'rgba(255,255,255,0.03)', fontSize: '7rem' }}
      >
        {count}
      </div>

      <div
        className="relative text-6xl lg:text-7xl font-black mb-3 tabular-nums tracking-tight"
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #009B91 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          textShadow: 'none',
          filter: 'drop-shadow(0 2px 8px rgba(0,155,145,0.3))',
        }}
      >
        {count}
      </div>

      {/* Teal accent line under number */}
      <div
        className="mx-auto mb-3 h-0.5 w-10 rounded-full opacity-60 transition-all duration-300 group-hover:w-16 group-hover:opacity-100"
        style={{ background: 'linear-gradient(90deg, transparent, #009B91, transparent)' }}
      />

      <div className="relative text-white/80 font-semibold text-sm uppercase tracking-widest">
        {metric.label}
      </div>
    </motion.div>
  )
}

type Props = {
  title: string
  subtitle: string
  settings: Settings
  locale: string
}

export default function StrengthSection({ title, subtitle, settings, locale }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const strengths = getStrengths(settings, locale)

  return (
    <section
      ref={ref}
      className="section-padding"
      style={{ background: 'linear-gradient(135deg, #0B4D32 0%, #009B91 100%)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white mb-3">
            {title}
          </h2>
          <p className="text-white/70 max-w-xl mx-auto">{subtitle}</p>
        </div>

        <div
          className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-white/10 rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(255,255,255,0.15)',
            background: 'rgba(255,255,255,0.04)',
            backdropFilter: 'blur(8px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {strengths.map((m, i) => (
            <MetricCard key={i} metric={m} active={inView} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
