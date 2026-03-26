'use client'
import Link from 'next/link'

// ── Íconos SVG ─────────────────────────────────────────────────────
const Icons = {
  Notebooks: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="5" y="8" width="30" height="20" rx="2.5" stroke="currentColor" strokeWidth="2"/>
      <rect x="8" y="11" width="24" height="14" rx="1" fill="currentColor" opacity="0.12"/>
      <path d="M2 28h36l-2.5 3.5A2 2 0 0133.9 32H6.1a2 2 0 01-1.6-.5L2 28z" fill="currentColor" opacity="0.15" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="16" y="29.5" width="8" height="1.5" rx=".75" fill="currentColor" opacity="0.35"/>
    </svg>
  ),
  Componentes: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="13" y="13" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <rect x="17" y="17" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
      <path d="M20 7v6M20 27v6M7 20h6M27 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 7v6M20 27v6M7 20h6M27 20h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
    </svg>
  ),
  Gaming: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <path d="M7 17c0-2.2 1.8-4 4-4h18c2.2 0 4 1.8 4 4v4c0 4.4-3.6 8-8 8H15c-4.4 0-8-3.6-8-8v-4z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <path d="M15 18v5M12.5 20.5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="25.5" cy="19" r="1.5" fill="currentColor" opacity="0.6"/>
      <circle cx="28" cy="21.5" r="1.5" fill="currentColor" opacity="0.6"/>
    </svg>
  ),
  Celulares: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="12" y="4" width="16" height="32" rx="3" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <rect x="15" y="8" width="10" height="19" rx="1" fill="currentColor" opacity="0.12"/>
      <circle cx="20" cy="31" r="1.5" fill="currentColor" opacity="0.5"/>
      <rect x="17" y="5.5" width="6" height="1.5" rx=".75" fill="currentColor" opacity="0.35"/>
    </svg>
  ),
  Monitores: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="3" y="6" width="34" height="22" rx="2.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <rect x="6" y="9" width="28" height="16" rx="1" fill="currentColor" opacity="0.1"/>
      <path d="M14 28l-2 5M26 28l2 5M12 33h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M20 15a3 3 0 100 6 3 3 0 000-6z" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5"/>
    </svg>
  ),
  Accesorios: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="14" y="8" width="12" height="18" rx="6" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <path d="M20 26v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M16 32h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M26 12c3 1.5 5 4.4 5 8s-2 6.5-5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
      <path d="M14 12c-3 1.5-5 4.4-5 8s2 6.5 5 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45"/>
    </svg>
  ),
  Networking: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <circle cx="20" cy="20" r="3.5" fill="currentColor" opacity="0.4"/>
      <circle cx="20" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="20" cy="32" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="8" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15"/>
      <circle cx="32" cy="20" r="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15"/>
      <path d="M20 10.5v7M20 22.5v7M10.5 20h7M22.5 20h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  ),
  Impresoras: () => (
    <svg viewBox="0 0 40 40" fill="none" width="24" height="24">
      <rect x="7" y="14" width="26" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1"/>
      <path d="M13 14V9h14v5" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
      <rect x="11" y="22" width="18" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.08"/>
      <path d="M14 26.5h12M14 29.5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
      <circle cx="29" cy="19.5" r="1.5" fill="currentColor" opacity="0.4"/>
    </svg>
  ),
  // ── Info bar ────────────────────────────────────────────────────
  Envio: () => (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect width="48" height="48" rx="14" fill="var(--accent-bg)"/>
      <path d="M9 24h18v9H9z" stroke="var(--accent)" strokeWidth="1.8" fill="var(--accent)" fillOpacity="0.1" strokeLinejoin="round"/>
      <path d="M27 24h5.5L38 30v3H27V24z" stroke="var(--accent)" strokeWidth="1.8" fill="var(--accent)" fillOpacity="0.1" strokeLinejoin="round"/>
      <circle cx="14" cy="34.5" r="2.2" stroke="var(--accent)" strokeWidth="1.8" fill="white"/>
      <circle cx="31" cy="34.5" r="2.2" stroke="var(--accent)" strokeWidth="1.8" fill="white"/>
      <path d="M9 27.5h18" stroke="var(--accent)" strokeWidth="1.3" opacity="0.35"/>
    </svg>
  ),
  Pago: () => (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect width="48" height="48" rx="14" fill="var(--accent-bg)"/>
      <rect x="8" y="14" width="32" height="20" rx="3.5" stroke="var(--accent)" strokeWidth="1.8" fill="var(--accent)" fillOpacity="0.08"/>
      <rect x="8" y="20" width="32" height="5" fill="var(--accent)" fillOpacity="0.2"/>
      <rect x="11" y="28" width="10" height="3" rx="1.5" fill="var(--accent)" opacity="0.45"/>
      <rect x="23" y="28" width="6" height="3" rx="1.5" fill="var(--accent)" opacity="0.3"/>
    </svg>
  ),
  Devolucion: () => (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect width="48" height="48" rx="14" fill="var(--accent-bg)"/>
      <path d="M15 24a9 9 0 109-9h-5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      <path d="M15 19.5l4.5-4.5-4.5-4.5" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M20 24h8M20 28.5h5" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" opacity="0.45"/>
    </svg>
  ),
  Garantia: () => (
    <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
      <rect width="48" height="48" rx="14" fill="var(--accent-bg)"/>
      <path d="M24 9l12 4.5V23c0 7.2-5.1 13.9-12 16-6.9-2.1-12-8.8-12-16V13.5L24 9z" stroke="var(--accent)" strokeWidth="1.8" fill="var(--accent)" fillOpacity="0.1" strokeLinejoin="round"/>
      <path d="M18.5 23.5l4 4 7-8" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
}

const categories = [
  { name: 'Notebooks',   slug: 'Notebooks',   Icon: Icons.Notebooks,   color: '#7b2d9e' },
  { name: 'Componentes', slug: 'Componentes',  Icon: Icons.Componentes, color: '#b769bd' },
  { name: 'Gaming',      slug: 'Gaming',       Icon: Icons.Gaming,      color: '#9b4fa6' },
  { name: 'Celulares',   slug: 'Celulares',    Icon: Icons.Celulares,   color: '#c47fcb' },
  { name: 'Monitores',   slug: 'Monitores',    Icon: Icons.Monitores,   color: '#7b2d9e' },
  { name: 'Accesorios',  slug: 'Accesorios',   Icon: Icons.Accesorios,  color: '#b769bd' },
  { name: 'Networking',  slug: 'Networking',   Icon: Icons.Networking,  color: '#9b4fa6' },
  { name: 'Impresoras',  slug: 'Impresoras',   Icon: Icons.Impresoras,  color: '#d48fda' },
]

export const INFO_ITEMS = [
  { Icon: Icons.Envio,      title: 'Envío Express',    desc: 'Ciudad del Este mismo día' },
  { Icon: Icons.Pago,       title: 'Pagos seguros',    desc: 'Bancard · PayPal · Efectivo' },
  { Icon: Icons.Devolucion, title: 'Devoluciones',     desc: '30 días sin preguntas' },
  { Icon: Icons.Garantia,   title: 'Garantía oficial', desc: 'Todos los productos' },
]

export function CategoryGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-5">
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map(({ name, slug, Icon, color }) => (
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
              style={{ background: `${color}14`, color }}
            >
              <Icon />
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

export function GamerBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-3">
      <div className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #1a0030 0%, #3d1060 50%, #7b2d9e 100%)' }}>
        <div className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="absolute top-0 right-0 w-64 h-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at right,rgba(183,105,189,0.3) 0%,transparent 70%)' }} />
        <div className="relative px-8 py-6 flex items-center gap-6">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <svg viewBox="0 0 32 32" fill="none" width="22" height="22">
              <path d="M5 15c0-2 1.6-4 4-4h14c2.4 0 4 2 4 4v3c0 4-3.2 7-7 7H12c-3.8 0-7-3-7-7v-3z" stroke="white" strokeWidth="1.8" fill="white" fillOpacity="0.15"/>
              <path d="M12 14.5v5M9.5 17h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="22" cy="15.5" r="1.5" fill="white" opacity="0.7"/>
              <circle cx="24.5" cy="18" r="1.5" fill="white" opacity="0.7"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#d48fda' }}>Zona Gamer</p>
            <p className="text-xl font-black text-white mb-1">Armá tu PC ideal con componentes compatibles</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>Seleccioná CPU, motherboard, GPU y más — verificamos la compatibilidad en tiempo real</p>
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

export function PromosBanner() {
  const promos = [
    {
      href: '/products?category=Notebooks',
      bg: 'linear-gradient(135deg, #2d0a40, #7b2d9e)',
      label: 'Últimos modelos', title: 'Notebooks 2025', sub: 'Intel Core Ultra · AMD Ryzen AI',
      icon: (
        <svg viewBox="0 0 32 32" fill="none" width="30" height="30">
          <rect x="2" y="4" width="28" height="18" rx="2" stroke="white" strokeWidth="1.8" fill="white" fillOpacity="0.12"/>
          <path d="M0 22h32l-2.5 4H2.5L0 22z" fill="white" opacity="0.12" stroke="white" strokeWidth="1.2"/>
        </svg>
      ),
    },
    {
      href: '/products?category=Componentes&q=rtx',
      bg: 'linear-gradient(135deg, #1a0030, #5c1a70)',
      label: 'RTX 50 Series', title: 'Tarjetas Gráficas', sub: 'La nueva generación ya llegó',
      icon: (
        <svg viewBox="0 0 32 32" fill="none" width="30" height="30">
          <rect x="1" y="9" width="30" height="14" rx="2" stroke="white" strokeWidth="1.8" fill="white" fillOpacity="0.12"/>
          <rect x="4" y="12" width="14" height="8" rx="1" fill="white" opacity="0.12"/>
          <circle cx="24" cy="16" r="3.5" stroke="white" strokeWidth="1.5" fill="none"/>
          <path d="M7 9V6M11 9V6M15 9V6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
        </svg>
      ),
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
              <div style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>{p.icon}</div>
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
