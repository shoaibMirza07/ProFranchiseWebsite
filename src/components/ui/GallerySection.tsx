'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { SectionContent, str } from '@/lib/content'

interface GalleryImage {
  id: string
  url: string
  captionEn: string
  captionAr: string
}

export default function GallerySection({ 
  content, 
  locale, 
  images 
}: { 
  content: SectionContent; 
  locale: string; 
  images: GalleryImage[] 
}) {
  const isAr = locale === 'ar'
  const title = str(content, 'title') || (isAr ? 'معرض الصور' : 'Gallery')
  const subtitle = str(content, 'subtitle')

  if (images.length === 0) return null

  return (
    <section className="section-padding bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {(title || subtitle) && (
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
              {title}
            </h2>
            {subtitle && <p className="text-lg text-slate-500 max-w-2xl mx-auto">{subtitle}</p>}
            <div className="mx-auto mt-6 h-1 w-20 rounded-full" style={{ background: 'linear-gradient(90deg, #0B4D32, #009B91)' }} />
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {images.map((img, idx) => {
            const caption = isAr ? img.captionAr : img.captionEn
            return (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className="relative h-64 rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer"
              >
                <Image
                  src={img.url}
                  alt={caption || ''}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  {caption && <p className="text-white text-sm font-medium leading-normal">{caption}</p>}
                  <div className="mt-3 h-0.5 w-10 rounded-full bg-[#009B91]" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
