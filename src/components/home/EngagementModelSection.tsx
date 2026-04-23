'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'
import CtaGroup, { CtaItem } from '@/components/ui/CtaGroup'

type PillarKey = 'brand' | 'operator' | 'consumer' | 'employees' | 'supplyChain' | 'technology'

type Props = {
  // Tab 1: Hexagon (our framework)
  hexTitle: string
  hexSubtitle: string
  pillars: Record<string, { label: string; desc: string; imageUrl?: string; diagramUrl?: string }>

  // Tab 2: How We Select
  criteriaTitle: string
  criteriaSubtitle: string
  criteria: Array<{ number: string; label: string; desc: string; iconName?: string }>

  // Tab 3: How You Invest
  investTitle: string
  investSubtitle: string
  investCtas?: CtaItem[]
  steps: Array<{ number: string; label: string; desc: string }>
}

type TabId = 'framework' | 'select' | 'invest'

const TABS: { id: TabId; label: string }[] = [
  { id: 'framework', label: 'Our Framework' },
  { id: 'select', label: 'How We Select' },
  { id: 'invest', label: 'How You Invest' },
]

// ─── Hexagon helpers ──────────────────────────────────────────────────────────

const PILLARS: { key: PillarKey; angle: number }[] = [
  { key: 'brand', angle: 90 },
  { key: 'operator', angle: 30 },
  { key: 'consumer', angle: -30 },
  { key: 'employees', angle: -90 },
  { key: 'supplyChain', angle: -150 },
  { key: 'technology', angle: 150 },
]

// External pillars (indices 0-2): teal/cyan family
// Internal pillars (indices 3-5): dark green family
const PILLAR_COLORS = [
  '#009B91', // brand
  '#00a89e', // operator
  '#00b9a5', // consumer
  '#0B4D32', // employees
  '#126040', // supplyChain
  '#197550', // technology
]

const PILLAR_COLORS_ACTIVE = [
  '#00c4b8', // brand active
  '#00d1c3', // operator active
  '#00dfcc', // consumer active
  '#1a6b45', // employees active
  '#1f7a50', // supplyChain active
  '#268f5e', // technology active
]

function hexPoints(cx: number, cy: number, r: number, startAngle = 0): string {
  return Array.from({ length: 6 }, (_, i) => {
    const angle = ((i * 60 + startAngle) * Math.PI) / 180
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`
  }).join(' ')
}

function segmentPath(cx: number, cy: number, outerR: number, innerR: number, angleStart: number, angleEnd: number): string {
  const toRad = (a: number) => (a * Math.PI) / 180
  const o1x = cx + outerR * Math.cos(toRad(angleStart))
  const o1y = cy + outerR * Math.sin(toRad(angleStart))
  const o2x = cx + outerR * Math.cos(toRad(angleEnd))
  const o2y = cy + outerR * Math.sin(toRad(angleEnd))
  const i1x = cx + innerR * Math.cos(toRad(angleStart))
  const i1y = cy + innerR * Math.sin(toRad(angleStart))
  const i2x = cx + innerR * Math.cos(toRad(angleEnd))
  const i2y = cy + innerR * Math.sin(toRad(angleEnd))
  return `M ${o1x} ${o1y} A ${outerR} ${outerR} 0 0 1 ${o2x} ${o2y} L ${i2x} ${i2y} A ${innerR} ${innerR} 0 0 0 ${i1x} ${i1y} Z`
}

// ─── Framework Tab (Hexagon) ──────────────────────────────────────────────────

export function FrameworkTab({ pillars }: { pillars: Props['pillars'] }) {
  const [active, setActive] = useState<PillarKey>('brand')

  const CX = 250
  const CY = 250
  const OUTER_R = 220
  const INNER_R = 85
  const GAP = 4
  const ICON_R = 152
  const ICON_SIZE = 20
  const TEXT_R = 195

  const activePillar = pillars[active] ?? { label: '', desc: '' }
  const activeIndex = PILLARS.findIndex(p => p.key === active)

  return (
    <div className="flex flex-col lg:flex-row items-start gap-10 lg:gap-14">
      {/* SVG hexagon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex-shrink-0 w-full max-w-sm mx-auto lg:mx-0 lg:max-w-none lg:w-[480px]"
      >
        <svg viewBox="0 0 500 500" className="w-full drop-shadow-lg">
          <defs>
            {/* Clip paths for icons */}
            {PILLARS.map(({ key, angle }) => {
              const iconX = CX + ICON_R * Math.cos((angle * Math.PI) / 180)
              const iconY = CY + ICON_R * Math.sin((angle * Math.PI) / 180)
              return (
                <clipPath key={`clip-${key}`} id={`clip-eng-${key}`}>
                  <circle cx={iconX} cy={iconY} r={ICON_SIZE} />
                </clipPath>
              )
            })}

            {/* Glow filter for active segment */}
            <filter id="glow-teal" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-green" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Center gradient */}
            <radialGradient id="center-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#1a6b45" />
              <stop offset="100%" stopColor="#0B4D32" />
            </radialGradient>
          </defs>

          {/* Center hex */}
          <polygon
            points={hexPoints(CX, CY, INNER_R - GAP, -30)}
            fill="url(#center-grad)"
          />
          {/* Center label */}
          <text x={CX} y={CY - 12} textAnchor="middle" fill="white" fontSize="13" fontWeight="800" letterSpacing="0.5">
            ProFranchise
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fill="#009B91" fontSize="10" fontWeight="600">
            Hexagon
          </text>
          <text x={CX} y={CY + 23} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8">
            Framework
          </text>

          {/* Segments */}
          {PILLARS.map(({ key, angle }, i) => {
            const segStart = angle - 30 + GAP / 2
            const segEnd = angle + 30 - GAP / 2
            const isActive = active === key
            const baseColor = PILLAR_COLORS[i]
            const activeColor = PILLAR_COLORS_ACTIVE[i]

            const iconX = CX + ICON_R * Math.cos((angle * Math.PI) / 180)
            const iconY = CY + ICON_R * Math.sin((angle * Math.PI) / 180)
            const textX = CX + TEXT_R * Math.cos((angle * Math.PI) / 180)
            const textY = CY + TEXT_R * Math.sin((angle * Math.PI) / 180)

            const pillarImg = pillars[key]?.imageUrl
            const pillarLabel = pillars[key]?.label ?? key
            const labelParts = pillarLabel.split(' ')
            const isMultiLine = labelParts.length > 1

            return (
              <g key={key} style={{ cursor: 'pointer' }} onClick={() => setActive(key)}>
                {/* Active glow ring */}
                {isActive && (
                  <path
                    d={segmentPath(CX, CY, OUTER_R + 8, INNER_R + GAP - 4, segStart - 1, segEnd + 1)}
                    fill={activeColor}
                    opacity={0.35}
                    style={{ filter: 'blur(6px)' }}
                  />
                )}
                <path
                  d={segmentPath(CX, CY, OUTER_R, INNER_R + GAP, segStart, segEnd)}
                  fill={isActive ? activeColor : baseColor}
                  stroke="white"
                  strokeWidth={GAP}
                  opacity={isActive ? 1 : 0.82}
                  style={{ transition: 'fill 0.3s, opacity 0.3s' }}
                />

                {/* Icon: image if available, otherwise number */}
                {pillarImg ? (
                  <image
                    href={pillarImg}
                    x={iconX - ICON_SIZE}
                    y={iconY - ICON_SIZE}
                    width={ICON_SIZE * 2}
                    height={ICON_SIZE * 2}
                    clipPath={`url(#clip-eng-${key})`}
                    preserveAspectRatio="xMidYMid slice"
                    style={{ pointerEvents: 'none' }}
                  />
                ) : (
                  <text
                    x={iconX}
                    y={iconY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="700"
                    pointerEvents="none"
                  >
                    {i + 1}
                  </text>
                )}

                {/* Label text inside segment */}
                <text
                  x={textX}
                  y={isMultiLine ? textY - 5 : textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="white"
                  fontSize="8"
                  fontWeight={isActive ? '700' : '500'}
                  pointerEvents="none"
                  style={{ transition: 'font-weight 0.3s' }}
                >
                  {isMultiLine
                    ? labelParts.map((part, pi) => (
                        <tspan key={pi} x={textX} dy={pi === 0 ? 0 : '1.2em'}>
                          {part}
                        </tspan>
                      ))
                    : pillarLabel}
                </text>
              </g>
            )
          })}
        </svg>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            className="space-y-5"
          >
            {/* Diagram image if available */}
            {activePillar.diagramUrl && (
              <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activePillar.diagramUrl}
                  alt={activePillar.label}
                  className="w-full max-h-64 object-cover"
                />
              </div>
            )}

            {/* Icon (if no diagram) */}
            {!activePillar.diagramUrl && (
              <div className="flex items-center gap-4">
                {activePillar.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={activePillar.imageUrl}
                    alt={activePillar.label}
                    className="w-20 h-20 rounded-2xl object-contain border border-slate-100 bg-white p-2 shadow-sm"
                  />
                ) : (
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${PILLAR_COLORS[activeIndex]}, ${PILLAR_COLORS_ACTIVE[activeIndex]})` }}
                  >
                    {activeIndex + 1}
                  </div>
                )}
              </div>
            )}

            {/* Color accent bar */}
            <div
              className="h-1 w-16 rounded-full"
              style={{ background: `linear-gradient(90deg, ${PILLAR_COLORS[activeIndex]}, ${PILLAR_COLORS_ACTIVE[activeIndex]})` }}
            />

            <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900">
              {activePillar.label}
            </h3>
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">
              {activePillar.desc}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Pillar selector pills */}
        <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
          {PILLARS.map(({ key }, i) => {
            const pillarLabel = pillars[key]?.label ?? key
            const isActive = active === key
            return (
              <button
                key={key}
                onClick={() => setActive(key)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{
                  background: isActive ? PILLAR_COLORS[i] : 'transparent',
                  color: isActive ? 'white' : PILLAR_COLORS[i],
                  border: `1.5px solid ${PILLAR_COLORS[i]}`,
                }}
              >
                {pillarLabel}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Criteria Tab (How We Select) ────────────────────────────────────────────

function SelectTab({ title, subtitle, criteria }: { title: string; subtitle: string; criteria: Props['criteria'] }) {
  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 max-w-2xl mx-auto">{subtitle}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {criteria.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className="group relative rounded-2xl p-8 border border-slate-100 card-hover overflow-hidden bg-white"
          >
            {/* Top accent stripe */}
            <div
              className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
              style={{
                background: `linear-gradient(90deg, #0B4D32 ${i * 33}%, #009B91 100%)`,
              }}
            />

            {/* Watermark number */}
            <div
              className="absolute -top-2 -right-2 text-8xl font-black leading-none select-none pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, #0B4D32, #009B91)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                opacity: 0.08,
              }}
            >
              {item.number}
            </div>

            {/* Number badge */}
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-5"
              style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
            >
              {item.number}
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">
              {item.label}
            </h3>
            <p className="text-slate-500 leading-relaxed text-sm">
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

// ─── Invest Tab (How You Invest) ──────────────────────────────────────────────

function InvestTab({ title, subtitle, ctas, steps }: { title: string; subtitle: string; ctas?: CtaItem[]; steps: Props['steps'] }) {
  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-3">{title}</h3>
        <p className="text-slate-500 max-w-xl mx-auto">{subtitle}</p>
      </div>

      <div className="relative">
        {/* Desktop connecting dashed line */}
        <div className="hidden md:block absolute top-10 left-0 right-0 h-px mx-16 border-t-2 border-dashed border-slate-200 z-0" />

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="relative text-center group z-10"
            >
              {/* Number circle */}
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative z-10 text-white text-xl font-extrabold transition-transform duration-300 group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, #0B4D32 ${i * 25}%, #009B91 100%)`,
                  boxShadow: '0 6px 24px rgba(0,155,145,0.35)',
                }}
              >
                {step.number || String(i + 1).padStart(2, '0')}
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                {step.label}
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      <CtaGroup ctas={ctas} align="center" className="mt-12" />
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function EngagementModelSection({
  hexTitle,
  hexSubtitle,
  pillars,
  criteriaTitle,
  criteriaSubtitle,
  criteria,
  investTitle,
  investSubtitle,
  investCtas,
  steps,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('framework')

  return (
    <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            Our Engagement Model
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            {activeTab === 'framework' ? hexSubtitle
              : activeTab === 'select' ? criteriaSubtitle
              : investSubtitle}
          </p>
        </motion.div>

        {/* Tab bar */}
        <div className="flex justify-center mb-10">
          <div className="flex gap-1 p-1 rounded-full bg-white border border-slate-200 shadow-sm">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: activeTab === tab.id ? '#009B91' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#64748b',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
          >
            {activeTab === 'framework' && (
              <FrameworkTab pillars={pillars} />
            )}
            {activeTab === 'select' && (
              <SelectTab title={criteriaTitle} subtitle={criteriaSubtitle} criteria={criteria} />
            )}
            {activeTab === 'invest' && (
              <InvestTab title={investTitle} subtitle={investSubtitle} ctas={investCtas} steps={steps} />
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </section>
  )
}
