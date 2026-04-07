import { Target, Scale, Building2, Eye, Zap } from 'lucide-react'
import type { ComponentType } from 'react'

type IconName = 'Target' | 'Scale' | 'Building2' | 'Eye' | 'Zap'

const ICON_MAP: Record<IconName, ComponentType<{ size?: number; className?: string }>> = {
  Target,
  Scale,
  Building2,
  Eye,
  Zap,
}

type ValueItem = {
  icon: string
  label: string
  desc: string
}

type Props = {
  title: string
  items: ValueItem[]
}

export default function ValuesSection({ title, items }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900">
            {title}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {items.map((item, i) => {
            const Icon = ICON_MAP[item.icon as IconName] ?? Target
            return (
              <div
                key={i}
                className="group bg-white rounded-2xl p-6 border border-slate-100 card-hover text-center"
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
                >
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-slate-900 mb-2">
                  {item.label}
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
