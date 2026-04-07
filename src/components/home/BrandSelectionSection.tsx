type CriterionData = {
  number: string
  label: string
  desc: string
}

type Props = {
  title: string
  subtitle: string
  criteria: CriterionData[]
}

export default function BrandSelectionSection({ title, subtitle, criteria }: Props) {
  return (
    <section className="section-padding bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-3">
            {title}
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {criteria.map((item, i) => (
            <div
              key={i}
              className="group relative rounded-2xl p-8 border border-slate-100 card-hover overflow-hidden"
              style={{ background: 'white' }}
            >
              {/* Gradient accent */}
              <div
                className="absolute top-0 inset-x-0 h-1 rounded-t-2xl"
                style={{
                  background: `linear-gradient(90deg, #0B4D32 ${i * 33}%, #009B91 100%)`,
                }}
              />

              {/* Number */}
              <div
                className="text-6xl font-black mb-4 select-none leading-none"
                style={{
                  background: 'linear-gradient(135deg, #0B4D32, #009B91)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  opacity: 0.15,
                }}
              >
                {item.number}
              </div>

              {/* Icon dot */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm mb-5"
                style={{ background: 'linear-gradient(135deg, #0B4D32, #009B91)' }}
              >
                {item.number}
              </div>

              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {item.label}
              </h3>
              <p className="text-slate-500 leading-relaxed text-sm">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
