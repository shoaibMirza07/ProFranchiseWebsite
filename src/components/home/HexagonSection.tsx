'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

type PillarKey = 'brand' | 'operator' | 'consumer' | 'employees' | 'supplyChain' | 'technology'

type PillarData = {
  label: string
  desc: string
  imageUrl?: string
}

const PILLARS: { key: PillarKey; angle: number }[] = [
  { key: 'brand', angle: 90 },
  { key: 'operator', angle: 30 },
  { key: 'consumer', angle: -30 },
  { key: 'employees', angle: -90 },
  { key: 'supplyChain', angle: -150 },
  { key: 'technology', angle: 150 },
]

const INNER_R = 85 // hexagon inner shape radius

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

type Props = {
  title: string
  subtitle: string
  pillars: Record<string, PillarData>
}

export default function HexagonSection({ title, subtitle, pillars }: Props) {
  const [active, setActive] = useState<PillarKey>('brand')

  const CX = 250
  const CY = 250
  const OUTER_R = 220
  const GAP = 4

  // Radii for content inside each segment
  const ICON_R = 115   // icon / number sits here
  const ICON_SIZE = 16 // half-size for clip circle
  const TEXT_R = 182   // label text sits here

  const activePillar = pillars[active] ?? { label: '', desc: '' }

  return (
    <section className="section-padding" style={{ background: 'var(--color-muted)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">{subtitle}</p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* SVG hexagon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-shrink-0 w-full max-w-sm lg:max-w-none lg:w-[500px]"
          >
            <svg viewBox="0 0 500 500" className="w-full">
              {/* Clip paths for icons */}
              <defs>
                {PILLARS.map(({ key, angle }) => {
                  const iconX = CX + ICON_R * Math.cos((angle * Math.PI) / 180)
                  const iconY = CY + ICON_R * Math.sin((angle * Math.PI) / 180)
                  return (
                    <clipPath key={`clip-${key}`} id={`clip-${key}`}>
                      <circle cx={iconX} cy={iconY} r={ICON_SIZE} />
                    </clipPath>
                  )
                })}
              </defs>

              {/* Center hex */}
              <polygon
                points={hexPoints(CX, CY, INNER_R - GAP, -30)}
                fill="#0B4D32"
              />
              {/* Center label */}
              <text x={CX} y={CY - 10} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">
                ProFranchise
              </text>
              <text x={CX} y={CY + 10} textAnchor="middle" fill="#009B91" fontSize="11">
                Hexagon
              </text>

              {/* Segments */}
              {PILLARS.map(({ key, angle }, i) => {
                const segStart = angle - 30 + GAP / 2
                const segEnd = angle + 30 - GAP / 2
                const isActive = active === key

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
                    <path
                      d={segmentPath(CX, CY, OUTER_R, INNER_R + GAP, segStart, segEnd)}
                      fill={isActive ? '#009B91' : '#0B4D32'}
                      stroke="white"
                      strokeWidth={GAP}
                      opacity={isActive ? 1 : 0.75}
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
                        clipPath={`url(#clip-${key})`}
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
                        fontSize="11"
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
                      fontSize="8.5"
                      fontWeight={isActive ? '700' : '500'}
                      pointerEvents="none"
                      style={{ transition: 'fill 0.3s' }}
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

          {/* Right: active pillar info */}
          <motion.div
            key={active}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 max-w-lg"
          >
            <div className="flex items-center gap-4 mb-5">
              {activePillar.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={activePillar.imageUrl}
                  alt={activePillar.label}
                  className="w-24 h-24 rounded-2xl object-contain border border-slate-100 bg-white p-2 shadow-sm"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
                >
                  {PILLARS.findIndex(p => p.key === active) + 1}
                </div>
              )}
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 mb-3">
              {activePillar.label}
            </h3>
            <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-wrap">
              {activePillar.desc}
            </p>

            {/* Pillar selector */}
            <div className="flex flex-wrap gap-2 mt-8">
              {PILLARS.map(({ key }) => {
                const pillarLabel = pillars[key]?.label ?? key
                return (
                  <button
                    key={key}
                    onClick={() => setActive(key)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{
                      background: active === key ? '#009B91' : 'transparent',
                      color: active === key ? 'white' : '#009B91',
                      border: '1.5px solid #009B91',
                    }}
                  >
                    {pillarLabel}
                  </button>
                )
              })}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
