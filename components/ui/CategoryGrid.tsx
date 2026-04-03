'use client'
import Link from 'next/link'
import {
  Laptop, Cpu, Gamepad2, Smartphone, Monitor, Mouse, Wifi, Printer,
} from 'lucide-react'

// ── Categorías con íconos Lucide ──────────────────────────────────
const categories = [
  { name: 'Notebooks',   slug: 'Notebooks',   icon: Laptop,     color: '#7b2d9e' },
  { name: 'Componentes', slug: 'Componentes',  icon: Cpu,        color: '#9b4fa6' },
  { name: 'Gaming',      slug: 'Gaming',       icon: Gamepad2,   color: '#b769bd' },
  { name: 'Celulares',   slug: 'Celulares',    icon: Smartphone, color: '#7b2d9e' },
  { name: 'Monitores',   slug: 'Monitores',    icon: Monitor,    color: '#9b4fa6' },
  { name: 'Accesorios',  slug: 'Accesorios',   icon: Mouse,      color: '#b769bd' },
  { name: 'Networking',  slug: 'Networking',   icon: Wifi,       color: '#7b2d9e' },
  { name: 'Impresoras',  slug: 'Impresoras',   icon: Printer,    color: '#9b4fa6' },
]

// ── CategoryGrid ──────────────────────────────────────────────────
export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-5">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map(({ name, slug, icon: Icon, color }) => (
          <Link
            key={slug}
            href={`/products?category=${slug}`}
            className="group bg-white rounded-xl p-3 text-center transition-all duration-200 hover:-translate-y-1"
            style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = color
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 6px 20px ${color}28`
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
              ;(e.currentTarget as HTMLAnchorElement).style.boxShadow = 'var(--shadow)'
            }}
          >
            <div
              className="w-11 h-11 rounded-xl mx-auto mb-2 flex items-center justify-center transition-transform group-hover:scale-110"
              style={{ background: `${color}12`, color }}
            >
              <Icon size={22} strokeWidth={1.5} />
            </div>
            <p className="text-xs font-bold leading-tight" style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
              {name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

// ── GamerBanner ───────────────────────────────────────────────────
export function GamerBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1a0030 0%, #3d1060 50%, #7b2d9e 100%)' }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Imagen de fondo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/banners/banner-gamer.png" alt="Armá tu PC"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ opacity: 0.35 }} />
        <div className="relative px-8 py-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Gamepad2 size={24} strokeWidth={1.5} color="white" />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#d48fda' }}>Zona Gamer</p>
            <p className="text-xl font-black text-white mb-1">Armá tu PC ideal con componentes compatibles</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>
              Seleccioná CPU, motherboard, GPU y más — verificamos la compatibilidad en tiempo real
            </p>
          </div>
          <Link href="/gamer"
            className="shrink-0 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
            style={{ background: '#b769bd', color: 'white', boxShadow: '0 4px 16px rgba(183,105,189,0.4)' }}>
            Armar PC →
          </Link>
        </div>
      </div>
    </section>
  )
}

// ── PromosBanner ──────────────────────────────────────────────────
export function PromosBanner() {
  const promos = [
    {
      href:  '/products?category=Notebooks',
      bg:    'linear-gradient(135deg, #2d0a40, #7b2d9e)',
      label: 'Últimos modelos',
      title: 'Notebooks 2025',
      sub:   'Intel Core Ultra · AMD Ryzen AI',
      icon:  <Laptop size={36} strokeWidth={1.2} color="white" />,
    },
    {
      href:  '/products?category=Componentes&q=rtx',
      bg:    'linear-gradient(135deg, #1a0030, #5c1a70)',
      label: 'RTX 50 Series',
      title: 'Tarjetas Gráficas',
      sub:   'La nueva generación ya llegó',
      icon:  <Cpu size={36} strokeWidth={1.2} color="white" />,
    },
  ]

  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="grid md:grid-cols-2 gap-3">
        {promos.map(p => (
          <Link key={p.href} href={p.href}
            className="group rounded-2xl overflow-hidden relative transition-all hover:-translate-y-0.5 hover:shadow-xl"
            style={{ background: p.bg, minHeight: '100px' }}>
            <div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
              style={{ background: 'radial-gradient(ellipse at right bottom,rgba(183,105,189,0.5),transparent 60%)' }} />
            <div className="relative p-5 flex items-center gap-5">
              <div style={{ opacity: 0.85 }}>{p.icon}</div>
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

// ── SectionTitle ──────────────────────────────────────────────────
export function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
      {children}
    </h2>
  )
}
