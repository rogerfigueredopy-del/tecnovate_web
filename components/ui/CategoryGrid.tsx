'use client'
import Link from 'next/link'

const categories = [
  { name: 'Notebooks',    slug: 'Notebooks',   icon: '💻', color: '#7b2d9e' },
  { name: 'Componentes',  slug: 'Componentes',  icon: '⚙️', color: '#b769bd' },
  { name: 'Gaming',       slug: 'Gaming',       icon: '🎮', color: '#9b4fa6' },
  { name: 'Celulares',    slug: 'Celulares',    icon: '📱', color: '#c47fcb' },
  { name: 'Monitores',    slug: 'Monitores',    icon: '🖥️', color: '#7b2d9e' },
  { name: 'Accesorios',   slug: 'Accesorios',   icon: '🖱️', color: '#b769bd' },
  { name: 'Networking',   slug: 'Networking',   icon: '📡', color: '#9b4fa6' },
  { name: 'Impresoras',   slug: 'Impresoras',   icon: '🖨️', color: '#d48fda' },
]

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-5">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="group bg-white rounded-xl p-3 text-center transition-all duration-200 hover:-translate-y-1"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = cat.color
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 20px ${cat.color}28`
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow)'
            }}
          >
            <div
              className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center text-xl transition-transform group-hover:scale-110"
              style={{ background: `${cat.color}14` }}
            >
              {cat.icon}
            </div>
            <p className="text-xs font-700 leading-tight" style={{ color: 'var(--text-secondary)', fontWeight: 700, fontSize: '11px' }}>
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
        className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1a0030 0%, #3d1060 50%, #7b2d9e 100%)' }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right, rgba(183,105,189,0.3) 0%, transparent 70%)' }}
        />

        <div className="relative px-8 py-6 flex items-center gap-6">
          <div className="text-5xl" style={{ filter: 'drop-shadow(0 0 12px rgba(183,105,189,0.6))' }}>⚡</div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#d48fda' }}>
              Zona Gamer
            </p>
            <p className="text-xl font-black text-white mb-1">Armá tu PC ideal con componentes compatibles</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Seleccioná CPU, motherboard, GPU y más — verificamos la compatibilidad en tiempo real
            </p>
          </div>
          <Link
            href="/gamer"
            className="shrink-0 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ background: '#b769bd', color: 'white', boxShadow: '0 4px 16px rgba(183,105,189,0.4)' }}
          >
            Armar PC →
          </Link>
        </div>
      </div>
    </section>
  )
}

export function PromosBanner() {
  const promos = [
    {
      href: '/products?category=Notebooks',
      bg: 'linear-gradient(135deg, #2d0a40, #7b2d9e)',
      icon: '💻',
      label: 'Últimos modelos',
      title: 'Notebooks 2025',
      sub: 'Intel Core Ultra · AMD Ryzen AI',
    },
    {
      href: '/products?category=Componentes&q=rtx',
      bg: 'linear-gradient(135deg, #1a0030, #5c1a70)',
      icon: '🎮',
      label: 'RTX 50 Series',
      title: 'Tarjetas Gráficas',
      sub: 'La nueva generación ya llegó',
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="grid md:grid-cols-2 gap-3">
        {promos.map(p => (
          <Link
            key={p.href}
            href={p.href}
            className="group rounded-2xl overflow-hidden relative transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: p.bg, minHeight: '100px' }}
          >
            <div
              className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
              style={{ background: 'radial-gradient(ellipse at right bottom, rgba(183,105,189,0.5), transparent 60%)' }}
            />
            <div className="relative p-5 flex items-center gap-5">
              <div className="text-4xl" style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>{p.icon}</div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider mb-0.5" style={{ color: '#d48fda' }}>{p.label}</p>
                <p className="text-lg font-black text-white leading-tight">{p.title}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{p.sub}</p>
              </div>
              <div className="ml-auto text-white opacity-40 group-hover:opacity-80 transition-opacity text-xl">→</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
      {children}
    </h2>
  )
}
