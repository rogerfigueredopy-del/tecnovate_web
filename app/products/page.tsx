'use client'
import { ProductCard } from '@/components/ui/ProductCard'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { SectionTitle } from '@/components/ui/CategoryGrid'
import { Search, SlidersHorizontal, ChevronDown, X } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const CATEGORIES = [
  { label: 'Todos', value: '' },
  { label: 'Notebooks', value: 'Notebooks' },
  { label: 'Componentes', value: 'Componentes' },
  { label: 'Gaming', value: 'Gaming' },
  { label: 'Celulares', value: 'Celulares' },
  { label: 'Monitores', value: 'Monitores' },
  { label: 'Accesorios', value: 'Accesorios' },
  { label: 'Networking', value: 'Networking' },
  { label: 'Impresoras', value: 'Impresoras' },
]

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Menor precio', value: 'price_asc' },
  { label: 'Mayor precio', value: 'price_desc' },
  { label: 'Con descuento', value: 'sale' },
]

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [selectedCat, setSelectedCat] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState('newest')

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
      if (sort === 'price_asc') prods.sort((a: any, b: any) => a.price - b.price)
      if (sort === 'price_desc') prods.sort((a: any, b: any) => b.price - a.price)
      if (sort === 'sale') prods = prods.filter((p: any) => p.oldPrice)
      setProducts(prods)
      setTotal(data.pagination?.total || prods.length)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [search, selectedCat, page, sort])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
  }

  const clearFilters = () => {
    setSelectedCat('')
    setSearch('')
    setPage(1)
  }

  const hasFilters = selectedCat || search

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-900" style={{ fontWeight: 900, color: 'var(--text-primary)' }}>
                {selectedCat || 'Todos los Productos'}
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {loading ? 'Cargando...' : `${total} productos`}
              </p>
            </div>
            <div className="flex gap-2 items-center">
              <form onSubmit={handleSearch} className="relative">
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar..."
                  className="pl-4 pr-10 py-2 text-sm rounded-lg w-48"
                  style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', outline: 'none' }}
                  onFocus={e => (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'}
                  onBlur={e => (e.target as HTMLInputElement).style.borderColor = 'var(--border)'}
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search size={14} style={{ color: 'var(--text-muted)' }} />
                </button>
              </form>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="py-2 px-3 text-sm rounded-lg"
                style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', outline: 'none' }}
              >
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {hasFilters && (
                <button onClick={clearFilters} className="flex items-center gap-1 px-3 py-2 text-sm rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-bg2)' }}>
                  <X size={14} /> Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => { setSelectedCat(cat.value); setPage(1) }}
                className="shrink-0 text-xs px-4 py-1.5 rounded-full font-600 transition-all"
                style={{
                  fontWeight: 600,
                  background: selectedCat === cat.value ? 'var(--accent)' : 'white',
                  color: selectedCat === cat.value ? 'white' : 'var(--text-secondary)',
                  border: selectedCat === cat.value ? '1px solid var(--accent)' : '1px solid var(--border)',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array(12).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--border)' }}>
                <div className="aspect-square" style={{ background: 'var(--bg-secondary)' }} />
                <div className="p-3 space-y-2">
                  <div className="h-3 rounded" style={{ background: 'var(--bg-tertiary)', width: '60%' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--bg-tertiary)' }} />
                  <div className="h-4 rounded" style={{ background: 'var(--bg-tertiary)', width: '80%' }} />
                  <div className="h-6 rounded" style={{ background: 'var(--bg-tertiary)', width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {products.map((p: any) => {
                // ProductCard imported above
                return <ProductCard key={p.id} product={p} />
              })}
            </div>

            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-lg font-700" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Sin resultados</p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Intentá con otro término</p>
                <button onClick={clearFilters} className="mt-4 px-5 py-2 rounded-lg text-white text-sm font-600" style={{ background: 'var(--accent)', fontWeight: 600 }}>
                  Limpiar filtros
                </button>
              </div>
            )}

            {/* Pagination */}
            {total > 24 && (
              <div className="flex justify-center gap-2 mt-8">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="px-4 py-2 text-sm rounded-lg font-600 disabled:opacity-40 transition-colors"
                  style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: 600 }}>
                  ← Anterior
                </button>
                {Array.from({ length: Math.min(5, Math.ceil(total / 24)) }, (_, i) => i + 1).map(n => (
                  <button key={n} onClick={() => setPage(n)}
                    className="w-9 h-9 text-sm rounded-lg font-600 transition-colors"
                    style={{
                      background: page === n ? 'var(--accent)' : 'white',
                      color: page === n ? 'white' : 'var(--text-primary)',
                      border: `1px solid ${page === n ? 'var(--accent)' : 'var(--border)'}`,
                      fontWeight: 600,
                    }}>
                    {n}
                  </button>
                ))}
                <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 24)}
                  className="px-4 py-2 text-sm rounded-lg font-600 disabled:opacity-40 transition-colors"
                  style={{ border: '1px solid var(--border)', background: 'white', color: 'var(--text-primary)', fontWeight: 600 }}>
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
