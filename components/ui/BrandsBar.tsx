'use client'
import Link from 'next/link'

const BRANDS = [
  { name: 'Apple',    q: 'apple',    color: '#1d1d1f' },
  { name: 'Samsung',  q: 'samsung',  color: '#1428a0' },
  { name: 'ASUS',     q: 'asus',     color: '#00539b' },
  { name: 'MSI',      q: 'msi',      color: '#cc0000' },
  { name: 'Lenovo',   q: 'lenovo',   color: '#e2231a' },
  { name: 'HP',       q: 'hp',       color: '#0096d6' },
  { name: 'Xiaomi',   q: 'xiaomi',   color: '#ff6900' },
  { name: 'NVIDIA',   q: 'nvidia',   color: '#76b900' },
  { name: 'AMD',      q: 'amd',      color: '#ed1c24' },
  { name: 'Garmin',   q: 'garmin',   color: '#007CC3' },
]

export function BrandsBar() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-4">
      <div className="bg-white rounded-2xl px-6 py-4" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Marcas disponibles
          </p>
          <Link href="/products" className="text-xs font-black" style={{ color: 'var(--accent)' }}>
            Ver todas →
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {BRANDS.map(b => (
            <Link
              key={b.name}
              href={`/products?q=${b.q}`}
              className="shrink-0 px-4 py-2 rounded-xl text-xs font-black transition-all hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap"
              style={{ border: '1.5px solid var(--border)', color: b.color, background: `${b.color}08` }}
            >
              {b.name}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
