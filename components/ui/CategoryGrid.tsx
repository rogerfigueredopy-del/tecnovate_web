'use client'
import Link from 'next/link'

const categories = [
  { name: 'Notebooks', slug: 'notebooks', icon: '💻', count: 32 },
  { name: 'Componentes PC', slug: 'componentes', icon: '🖥️', count: 87 },
  { name: 'Gaming', slug: 'gaming', icon: '🎮', count: 45 },
  { name: 'Celulares', slug: 'celulares', icon: '📱', count: 28 },
  { name: 'Monitores', slug: 'monitores', icon: '🖥', count: 19 },
  { name: 'Accesorios', slug: 'accesorios', icon: '🖱️', count: 64 },
  { name: 'Impresoras', slug: 'impresoras', icon: '🖨️', count: 12 },
  { name: 'Networking', slug: 'networking', icon: '📡', count: 23 },
]

export function CategoryGrid() {
  return (
    <section className="container mx-auto px-4 py-12">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-bold">Categorías</h2>
        <div className="flex-1 h-px bg-gray-800" />
      </div>
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {categories.map(cat => (
          <Link
            key={cat.slug}
            href={`/products?category=${cat.slug}`}
            className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center hover:border-cyan-500/50 hover:-translate-y-1 transition-all group"
          >
            <div className="text-2xl mb-2">{cat.icon}</div>
            <div className="text-xs font-medium text-gray-300 group-hover:text-white leading-tight">{cat.name}</div>
            <div className="text-xs text-gray-600 mt-0.5">{cat.count}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export function GamerBanner() {
  return (
    <section className="container mx-auto px-4 py-4">
      <div className="relative bg-gradient-to-r from-gray-900 via-purple-950/30 to-gray-900 border border-purple-500/20 rounded-2xl p-8 overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-gradient-to-l from-purple-500/5 to-transparent" />
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 text-[120px] font-black text-purple-500/5 select-none pointer-events-none">
          GAMING
        </div>
        <div className="relative z-10 flex items-center gap-6">
          <div className="text-5xl">⚡</div>
          <div className="flex-1">
            <h2 className="text-2xl font-black text-white mb-1">Zona Gamer — Armá tu PC ideal</h2>
            <p className="text-gray-400 text-sm">
              Seleccioná cada componente, verificá compatibilidad en tiempo real y comprá todo junto con un click.
            </p>
          </div>
          <Link
            href="/gamer"
            className="shrink-0 bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105 whitespace-nowrap"
          >
            Armar PC →
          </Link>
        </div>
      </div>
    </section>
  )
}
