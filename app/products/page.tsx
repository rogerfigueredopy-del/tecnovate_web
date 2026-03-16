'use client'
import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const CATEGORIES = [
  { label: 'Todos', value: '' },
  { label: 'Notebooks', value: 'notebooks' },
  { label: 'Componentes', value: 'componentes' },
  { label: 'Gaming', value: 'gaming' },
  { label: 'Celulares', value: 'celulares' },
  { label: 'Monitores', value: 'monitores' },
  { label: 'Accesorios', value: 'accesorios' },
]

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'newest' },
  { label: 'Precio: menor a mayor', value: 'price_asc' },
  { label: 'Precio: mayor a menor', value: 'price_desc' },
  { label: 'Más vendidos', value: 'popular' },
]

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [products, setProducts] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const q = searchParams.get('q') || ''
  const category = searchParams.get('category') || ''
  const [search, setSearch] = useState(q)
  const [selectedCat, setSelectedCat] = useState(category)
  const [sort, setSort] = useState('newest')
  const [showFilters, setShowFilters] = useState(false)

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (selectedCat) params.set('category', selectedCat)
    params.set('page', String(page))
    params.set('limit', '12')

    const res = await fetch(`/api/products?${params}`)
    const data = await res.json()
    setProducts(data.products || [])
    setTotal(data.pagination?.total || 0)
    setLoading(false)
  }, [search, selectedCat, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchProducts()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">
            {selectedCat ? CATEGORIES.find(c => c.value === selectedCat)?.label || selectedCat : 'Todos los Productos'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Cargando...' : `${total} productos encontrados`}
          </p>
        </div>

        {/* Search + sort */}
        <div className="flex gap-3 w-full sm:w-auto">
          <form onSubmit={handleSearch} className="relative flex-1 sm:w-72">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos..."
              className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-4 pr-10 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cyan-400">
              <Search size={16} />
            </button>
          </form>

          <div className="relative">
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="appearance-none bg-gray-900 border border-gray-700 rounded-xl pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-300 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar filters */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sticky top-24">
            <h3 className="font-semibold text-sm mb-3">Categorías</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => { setSelectedCat(cat.value); setPage(1) }}
                  className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    selectedCat === cat.value
                      ? 'bg-cyan-500/15 text-cyan-400 font-medium'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Mobile category pills */}
        <div className="lg:hidden flex gap-2 mb-4 overflow-x-auto pb-1 w-full">
          {CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => { setSelectedCat(cat.value); setPage(1) }}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                selectedCat === cat.value
                  ? 'bg-cyan-500 text-black border-cyan-500 font-semibold'
                  : 'border-gray-700 text-gray-400 hover:border-gray-500'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden animate-pulse">
                  <div className="aspect-square bg-gray-800" />
                  <div className="p-4 space-y-2">
                    <div className="h-3 bg-gray-800 rounded w-1/3" />
                    <div className="h-4 bg-gray-800 rounded w-4/5" />
                    <div className="h-4 bg-gray-800 rounded w-3/5" />
                    <div className="h-6 bg-gray-800 rounded w-2/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <ProductGrid products={products} />

              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-8">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm hover:border-cyan-500 disabled:opacity-40 transition-colors"
                  >
                    ← Anterior
                  </button>
                  <span className="flex items-center px-4 text-sm text-gray-400">
                    Página {page} de {Math.ceil(total / 12)}
                  </span>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= Math.ceil(total / 12)}
                    className="px-4 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm hover:border-cyan-500 disabled:opacity-40 transition-colors"
                  >
                    Siguiente →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
