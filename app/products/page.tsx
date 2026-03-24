'use client'
import { ProductCard } from '@/components/ui/ProductCard'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ── Configuración visual por categoría ─────────────────────────────
const CATEGORY_CONFIG: Record<string, {
  emoji: string
  title: string
  subtitle: string
  bg: string
  accent: string
}> = {
  Notebooks: {
    emoji: '💻',
    title: 'Notebooks',
    subtitle: 'Las mejores laptops del mercado — gaming, trabajo y estudio',
    bg: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 100%)',
    accent: '#b769bd',
  },
  Componentes: {
    emoji: '⚙️',
    title: 'Componentes PC',
    subtitle: 'CPUs, GPUs, RAM, almacenamiento y más para armar tu PC',
    bg: 'linear-gradient(135deg, #1a0030 0%, #5c1a70 100%)',
    accent: '#d48fda',
  },
  Gaming: {
    emoji: '🎮',
    title: 'Zona Gaming',
    subtitle: 'Equipos y accesorios para llevar tu gaming al siguiente nivel',
    bg: 'linear-gradient(135deg, #200838 0%, #6b2177 100%)',
    accent: '#c47fcb',
  },
  Celulares: {
    emoji: '📱',
    title: 'Celulares y Smartphones',
    subtitle: 'iPhone, Samsung, Xiaomi y más — todos los modelos disponibles',
    bg: 'linear-gradient(135deg, #1a0030 0%, #4a0a5c 100%)',
    accent: '#b769bd',
  },
  Monitores: {
    emoji: '🖥️',
    title: 'Monitores',
    subtitle: 'Monitores gaming, profesionales y de oficina — 4K, IPS, OLED',
    bg: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 100%)',
    accent: '#d48fda',
  },
  Accesorios: {
    emoji: '🖱️',
    title: 'Accesorios',
    subtitle: 'Teclados, mouses, auriculares, sillas gamer y mucho más',
    bg: 'linear-gradient(135deg, #1a0030 0%, #5c1a70 100%)',
    accent: '#c47fcb',
  },
  Networking: {
    emoji: '📡',
    title: 'Networking',
    subtitle: 'Routers, switches, cables y todo para tu red',
    bg: 'linear-gradient(135deg, #200838 0%, #5c1a70 100%)',
    accent: '#b769bd',
  },
  Impresoras: {
    emoji: '🖨️',
    title: 'Impresoras',
    subtitle: 'Impresoras laser, inkjet, multifunción y suministros',
    bg: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 100%)',
    accent: '#d48fda',
  },
}

const CATEGORIES = [
  { label: 'Todos',        value: '' },
  { label: 'Notebooks',    value: 'Notebooks' },
  { label: 'Componentes',  value: 'Componentes' },
  { label: 'Gaming',       value: 'Gaming' },
  { label: 'Celulares',    value: 'Celulares' },
  { label: 'Monitores',    value: 'Monitores' },
  { label: 'Accesorios',   value: 'Accesorios' },
  { label: 'Networking',   value: 'Networking' },
  { label: 'Impresoras',   value: 'Impresoras' },
]

const SORT_OPTIONS = [
  { label: 'Más recientes',  value: 'newest' },
  { label: 'Menor precio',   value: 'price_asc' },
  { label: 'Mayor precio',   value: 'price_desc' },
  { label: 'Con descuento',  value: 'sale' },
]

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const catConfig = CATEGORY_CONFIG[selectedCat]

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (selectedCat) params.set('category', selectedCat)
    params.set('page', String(page))
    params.set('limit', '24')
    try {
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      let prods = data.products || []
      if (sort === 'price_asc')  prods.sort((a: any, b: any) => a.price - b.price)
      if (sort === 'price_desc') prods.sort((a: any, b: any) => b.price - a.price)
      if (sort === 'sale')       prods = prods.filter((p: any) => p.oldPrice)
      setProducts(prods)
      setTotal(data.pagination?.total || prods.length)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [search, selectedCat, page, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const clearFilters = () => { setSelectedCat(''); setSearch(''); setPage(1) }
  const hasFilters = selectedCat || search

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Category Hero Header ───────────────────────────────────── */}
      {catConfig ? (
        <div
          className="relative overflow-hidden"
          style={{ background: catConfig.bg, minHeight: '140px' }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />
          {/* Big faded emoji */}
          <div
            className="absolute right-0 top-0 bottom-0 flex items-center select-none pointer-events-none"
            style={{ fontSize: '180px', opacity: 0.08, paddingRight: '32px' }}
          >
            {catConfig.emoji}
          </div>
          <div className="relative max-w-7xl mx-auto px-6 py-10 flex items-center gap-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              {catConfig.emoji}
            </div>
            <div>
              <p
                className="text-xs font-black uppercase tracking-widest mb-1"
                style={{ color: catConfig.accent }}
              >
                Categoría
              </p>
              <h1 className="text-2xl font-black text-white">{catConfig.title}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{catConfig.subtitle}</p>
            </div>
          </div>
        </div>
      ) : (
        /* Todos los productos - header simple */
        <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="max-w-7xl mx-auto px-6 py-5">
            <h1 className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>
              {search ? `Resultados para "${search}"` : 'Todos los Productos'}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {loading ? 'Buscando...' : `${total} productos encontrados`}
            </p>
          </div>
        </div>
      )}

      {/* ── Filters bar ───────────────────────────────────────────── */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">

            {/* Search */}
            <form
              onSubmit={e => { e.preventDefault(); setPage(1) }}
              className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }}
            >
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar producto..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              )}
            </form>

            {/* Right side controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Count badge */}
              {!loading && (
                <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                  {total} productos
                </span>
              )}

              {/* Sort */}
              <div className="relative">
                <select
                  value={sort}
                  onChange={e => setSort(e.target.value)}
                  className="appearance-none text-xs font-semibold pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Clear filters */}
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-colors"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}
                >
                  <X size={12} />
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCat(cat.value); setPage(1) }}
                className="shrink-0 text-xs font-bold px-4 py-1.5 rounded-xl transition-all whitespace-nowrap"
                style={{
                  background: selectedCat === cat.value ? 'var(--accent)' : 'white',
                  color: selectedCat === cat.value ? 'white' : 'var(--text-secondary)',
                  border: selectedCat === cat.value ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--border)' }}>
                <div className="aspect-square" style={{ background: 'var(--bg-secondary)' }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded" style={{ background: 'var(--border)', width: '60%' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--border)', width: '80%' }} />
                  <div className="h-6 rounded" style={{ background: 'var(--border)', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
            </div>

            {products.length === 0 && (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Sin resultados</p>
                <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Intentá con otro término o categoría</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 rounded-xl text-white text-sm font-bold"
                  style={{ background: 'var(--accent)' }}
                >
                  Ver todos los productos
                </button>
              </div>
            )}

            {/* Pagination */}
            {total > 24 && (
              <div className="flex justify-center gap-2 mt-10">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
                  style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
                >
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(total / 24)) }, (_, i) => i + 1).map(n => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-9 h-9 text-sm font-bold rounded-xl transition-colors"
                    style={{
                      background: page === n ? 'var(--accent)' : 'white',
                      color: page === n ? 'white' : 'var(--text-primary)',
                      border: `1.5px solid ${page === n ? 'var(--accent)' : 'var(--border)'}`,
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(total / 24)}
                  className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-40 transition-colors"
                  style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  )
}
