'use client'

export const IC = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#009B91] transition-colors"

interface BilFieldProps {
  label: string
  hint?: string
  enValue: string
  arValue: string
  onEnChange: (v: string) => void
  onArChange: (v: string) => void
  type?: 'text' | 'textarea'
  rows?: number
  enPlaceholder?: string
  arPlaceholder?: string
}

export default function BilField({
  label, hint,
  enValue, arValue,
  onEnChange, onArChange,
  type = 'text', rows = 2,
  enPlaceholder, arPlaceholder,
}: BilFieldProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-700">{label}</p>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-400 mb-1">English</p>
          {type === 'textarea' ? (
            <textarea value={enValue} onChange={e => onEnChange(e.target.value)}
              rows={rows} placeholder={enPlaceholder}
              className={`${IC} resize-y`} />
          ) : (
            <input value={enValue} onChange={e => onEnChange(e.target.value)}
              placeholder={enPlaceholder} className={IC} />
          )}
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Arabic</p>
          {type === 'textarea' ? (
            <textarea value={arValue} onChange={e => onArChange(e.target.value)}
              rows={rows} placeholder={arPlaceholder} dir="rtl"
              className={`${IC} resize-y`} />
          ) : (
            <input value={arValue} onChange={e => onArChange(e.target.value)}
              placeholder={arPlaceholder} dir="rtl" className={IC} />
          )}
        </div>
      </div>
    </div>
  )
}
