import Image from 'next/image'
import { SectionContent, str, getCtas } from '@/lib/content'
import CtaGroup from '@/components/ui/CtaGroup'

export default function TextBlockSection({ content }: { content: SectionContent }) {
  const title = str(content, 'title')
  const subtitle = str(content, 'subtitle')
  const body = str(content, 'body')
  const subtext = str(content, 'subtext')
  const imageUrl = str(content, 'imageUrl')
  const ctas = getCtas(content, 'ctas')

  if (!title && !body && !imageUrl) return null

  return (
    <section className="section-padding bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 ${imageUrl ? 'lg:grid-cols-2 gap-12 lg:gap-16 items-center' : ''}`}>
          
          {/* Content Area */}
          <div className={!imageUrl ? 'text-start mx-auto max-w-3xl' : ''}>
            {title && (
              <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">
                {title}
              </h2>
            )}
            
            {subtitle && (
              <h3 className="text-xl font-medium text-[#009B91] mb-6">
                {subtitle}
              </h3>
            )}
            
            {body && (
              <div 
                className="prose prose-slate prose-lg max-w-none text-slate-600 leading-relaxed mb-8 whitespace-pre-wrap"
              >
                {body}
              </div>
            )}
            
            {subtext && (
              <p className="text-sm text-slate-500 italic mb-8 border-l-2 border-slate-200 pl-4 py-1">
                {subtext}
              </p>
            )}

            <CtaGroup ctas={ctas} align="start" />
          </div>

          {/* Image Area */}
          {imageUrl && (
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border border-slate-100">
              <Image 
                src={imageUrl} 
                alt={title || 'Section Image'} 
                fill 
                className="object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          )}
          
        </div>
      </div>
    </section>
  )
}
