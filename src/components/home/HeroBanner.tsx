'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import CtaGroup, { CtaItem } from '@/components/ui/CtaGroup'

const SLIDE_INTERVAL = 5000

const GRADIENTS = [
  'linear-gradient(135deg, var(--color-forest, #0B4D32) 0%, var(--color-teal, #009B91) 100%)',
  'linear-gradient(135deg, var(--color-forest, #0B4D32) 0%, var(--color-teal, #009B91) 50%, var(--color-forest, #0B4D32) 100%)',
  'linear-gradient(135deg, var(--color-teal, #009B91) 0%, var(--color-forest, #0B4D32) 100%)',
]

type SlideData = {
  label: string
  title: string
  titleSize?: string
  imageUrl?: string
  subtitle?: string
  ctas?: CtaItem[]
}

type Props = {
  slides: SlideData[]
  ctas?: CtaItem[]
  bgUrl?: string
}

export default function HeroBanner({ slides, ctas, bgUrl }: Props) {
  const displaySlides = slides.length > 0 ? slides : [{ label: '', title: '' }]

  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const goTo = useCallback((index: number, dir?: number) => {
    setDirection(dir ?? (index > current ? 1 : -1))
    setCurrent(index)
  }, [current])

  const next = useCallback(() => {
    goTo((current + 1) % displaySlides.length, 1)
  }, [current, goTo, displaySlides.length])

  const prev = useCallback(() => {
    goTo((current - 1 + displaySlides.length) % displaySlides.length, -1)
  }, [current, goTo, displaySlides.length])

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const timer = setInterval(next, SLIDE_INTERVAL)
    return () => clearInterval(timer)
  }, [next, displaySlides.length])

  const gradient = GRADIENTS[current % GRADIENTS.length]
  const slide = displaySlides[current]

  const variants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.7, ease: [0.32, 0.72, 0, 1] },
    },
    exit: (dir: number) => ({
      x: dir > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: { duration: 0.5 },
    }),
  }

  const contentVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.2 } },
  }

  return (
    <section 
      className="relative h-screen min-h-[600px] overflow-hidden"
      style={{
        background: bgUrl && !bgUrl.match(/\.(mp4|webm)$/i) ? `url(${bgUrl}) center/cover no-repeat` : undefined
      }}
    >
      {bgUrl?.match(/\.(mp4|webm)$/i) && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src={bgUrl}
        />
      )}
      <AnimatePresence custom={direction} initial={false}>
        <motion.div
          key={current}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
          style={{ 
            background: !bgUrl ? gradient : undefined 
          }}
        >
          {/* Network pattern overlay */}
          <div className="absolute inset-0 network-pattern opacity-40" />
          {/* Hero overlay */}
          <div className="absolute inset-0 hero-overlay" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={current + '-content'}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center"
            >
              <div className="lg:col-span-6 max-w-2xl">
                {/* Label badge */}
                {slide.label && (
                  <span
                    className="inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-5 border"
                    style={{
                      background: 'rgba(0,155,145,0.2)',
                      borderColor: 'rgba(0,155,145,0.6)',
                      color: '#009B91',
                    }}
                  >
                    {slide.label}
                  </span>
                )}

                {/* Title */}
                <h1 className={`${slide.titleSize ?? 'text-5xl'} font-extrabold text-white leading-tight mb-6`}>
                  {slide.title}
                </h1>

                {/* Subtitle */}
                {slide.subtitle && (
                  <p className="text-lg text-white/90 mb-8 max-w-xl">
                    {slide.subtitle}
                  </p>
                )}

                {/* CTAs */}
                <CtaGroup ctas={slide.ctas?.length ? slide.ctas : ctas} />
              </div>

              {slide.imageUrl && (
                <div className="lg:col-span-6 mt-8 lg:mt-0">
                  <div className="relative w-full aspect-video lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-white/20 ml-auto">
                    {slide.imageUrl.match(/\.(mp4|webm)$/i) ? (
                      <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                        src={slide.imageUrl}
                      />
                    ) : (
                      <img
                        src={slide.imageUrl}
                        alt={slide.title}
                        className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                      />
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation arrows */}
      {displaySlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
            style={{ color: 'var(--color-arrow, #ffffff)' }}
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/20 transition-colors backdrop-blur-sm"
            style={{ color: 'var(--color-arrow, #ffffff)' }}
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {displaySlides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === current ? '28px' : '8px',
                  height: '8px',
                  background: i === current ? '#009B91' : 'rgba(255,255,255,0.4)',
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
