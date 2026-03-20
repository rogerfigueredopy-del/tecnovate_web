'use client'
import Link from 'next/link'

const categories = [
  { name: 'Notebooks', slug: 'Notebooks', icon: '💻', color: '#4a9eff' },
  { name: 'Componentes', slug: 'Componentes', icon: '⚙️', color: '#b769bd' },
  { name: 'Gaming', slug: 'Gaming', icon: '🎮', color: '#dc2626' },
  { name: 'Celulares', slug: 'Celulares', icon: '📱', color: '#22c55e' },
  { name: 'Monitores', slug: 'Monitores', icon: '🖥️', color: '#f59e0b' },
  { name: 'Accesorios', slug: 'Accesorios', icon: '🖱️', color: '#6366f1' },
  { name: 'Networking', slug: 'Networking', icon: '📡', color: '#0891b2' },
  { name: 'Impresoras', slug: 'Impresoras', icon: '🖨️', color: '#64748b' },
]

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group bg-white rounded-xl p-3 text-center transition-all hover:-translate-y-1"
            style={{
              border: '1px solid var(--border)',
              boxShadow: 'var(--shadow)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = cat.color
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 4px 16px ${cat.color}22`
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow)'
            }}
          >
            <div className="text-2xl mb-1.5">{cat.icon}</div>
            <p className="text-xs font-600 leading-tight" style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px' }}>
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function GamerBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div
        className="rounded-xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1a0030, #3d1a5c, #0a1a40)' }}
      >
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }} />
        <div className="relative px-8 py-6 flex items-center gap-6">
          <div className="text-5xl">⚡</div>
          <div className="flex-1">
            <p className="text-xs font-800 mb-1" style={{ color: 'var(--accent-light)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
              Zona Gamer
            </p>
            <h2 className="text-xl font-900 text-white mb-1" style={{ fontWeight: 900 }}>
              Armá tu PC ideal con componentes compatibles
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
              Seleccioná CPU, motherboard, GPU y más — verificamos la compatibilidad en tiempo real
            </p>
          </div>
          <Link
            href="/gamer"
            className="shrink-0 px-6 py-3 rounded-xl text-white font-700 transition-all hover:-translate-y-0.5 whitespace-nowrap"
            style={{ background: 'var(--accent)', fontWeight: 700, boxShadow: '0 4px 14px rgba(183,105,189,0.4)' }}
          >
            Armar PC →
          </Link>
        </div>
      </div>
    </section>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="text-lg font-800 mb-4"
      style={{
        fontWeight: 800,
        color: 'var(--text-primary)',
        borderLeft: '4px solid var(--accent)',
        paddingLeft: '12px',
      }}
    >
      {children}
    </h2>
  )
}
