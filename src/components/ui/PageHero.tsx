export default function PageHero({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section
      className="relative pt-32 pb-20 overflow-hidden text-white text-center"
      style={{ background: 'linear-gradient(135deg, #0B4D32 0%, #009B91 100%)' }}
    >
      <div className="absolute inset-0 network-pattern opacity-30" />
      <div className="absolute inset-0 hero-overlay" />
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl lg:text-5xl font-extrabold mb-4">{title}</h1>
        {subtitle && (
          <p className="text-white/80 text-lg max-w-xl mx-auto">{subtitle}</p>
        )}
      </div>
    </section>
  )
}
