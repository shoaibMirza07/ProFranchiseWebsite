'use client'

import { Link } from '@/lib/navigation'
import { ChevronRight } from 'lucide-react'

export type CtaItem = {
  text: string
  url: string
  variant?: 'primary' | 'outline' | 'ghost' | string
}

type Props = {
  ctas?: CtaItem[]
  className?: string
  align?: 'start' | 'center' | 'end'
}

export default function CtaGroup({ ctas, className = '', align = 'start' }: Props) {
  if (!ctas || ctas.length === 0) return null

  const alignmentClass = 
    align === 'center' ? 'justify-center' :
    align === 'end' ? 'justify-end' : 'justify-start'

  return (
    <div className={`flex flex-wrap items-center gap-4 ${alignmentClass} ${className}`}>
      {ctas.map((cta, i) => {
        const variant = cta.variant || 'primary'
        
        let btnClass = 'btn-primary text-base'
        if (variant === 'outline') {
          btnClass = 'btn-outline text-base'
        } else if (variant === 'ghost') {
          btnClass = 'inline-flex items-center gap-1.5 text-sm font-semibold text-[#009B91] hover:text-[#0B4D32] transition-colors'
        }

        return (
          <Link key={i} href={cta.url || '#'} className={btnClass}>
            {cta.text}
            <ChevronRight size={variant === 'ghost' ? 16 : 18} />
          </Link>
        )
      })}
    </div>
  )
}
