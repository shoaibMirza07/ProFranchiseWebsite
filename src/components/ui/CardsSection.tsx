'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { SectionContent, str, arr } from '@/lib/content'

interface CardItem {
  imageUrl?: string
  title?: string
  body?: string
}

export default function CardsSection({ content, locale }: { content: SectionContent; locale: string }) {
  const isAr = locale === 'ar'
  const title = str(content, 'title')
  const subtitle = str(content, 'subtitle')
  const items = arr<CardItem>(content, 'items')

  if (items.length === 0 && !title) return null

  return (
    <section className="section-padding bg-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            {title && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
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
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full"
            >
              {item.imageUrl && (
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={item.imageUrl}
                    alt={item.title || ''}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              )}
              <div className="p-8 flex flex-col flex-1">
                {item.title && (
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#009B91] transition-colors">
                    {item.title}
                  </h3>
                )}
                {item.body && (
                  <p className="text-slate-600 leading-relaxed text-sm lg:text-base">
                    {item.body}
                  </p>
                )}
                <div className="mt-auto pt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="h-0.5 w-12 rounded-full" style={{ background: '#009B91' }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
