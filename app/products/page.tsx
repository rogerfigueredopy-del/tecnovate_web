'use client'
import { ProductCard } from '@/components/ui/ProductCard'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, ChevronDown, SlidersHorizontal, ChevronUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

// ── Configuración visual por categoría ─────────────────────────────
const CATEGORY_CONFIG: Record<string, { emoji: string; title: string; subtitle: string; bg: string; accent: string }> = {
  Notebooks:    { emoji: '💻', title: 'Notebooks',              subtitle: 'Las mejores laptops del mercado — gaming, trabajo y estudio',      bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)',  accent: '#b769bd' },
  Componentes:  { emoji: '⚙️', title: 'Componentes PC',         subtitle: 'CPUs, GPUs, RAM, almacenamiento y más para armar tu PC',           bg: 'linear-gradient(135deg,#1a0030,#5c1a70)',  accent: '#d48fda' },
  Gaming:       { emoji: '🎮', title: 'Zona Gaming',             subtitle: 'Equipos y accesorios para llevar tu gaming al siguiente nivel',    bg: 'linear-gradient(135deg,#200838,#6b2177)',  accent: '#c47fcb' },
  Celulares:    { emoji: '📱', title: 'Celulares y Smartphones', subtitle: 'iPhone, Samsung, Xiaomi y más — todos los modelos disponibles',    bg: 'linear-gradient(135deg,#1a0030,#4a0a5c)',  accent: '#b769bd' },
  Monitores:    { emoji: '🖥️', title: 'Monitores',              subtitle: 'Monitores gaming, profesionales y de oficina — 4K, IPS, OLED',     bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)',  accent: '#d48fda' },
  Accesorios:   { emoji: '🖱️', title: 'Accesorios',             subtitle: 'Teclados, mouses, auriculares, perfumes y mucho más',              bg: 'linear-gradient(135deg,#1a0030,#5c1a70)',  accent: '#c47fcb' },
  Networking:   { emoji: '📡', title: 'Networking',              subtitle: 'Routers, cámaras, smart home y todo para tu red',                  bg: 'linear-gradient(135deg,#200838,#5c1a70)',  accent: '#b769bd' },
  Impresoras:   { emoji: '🖨️', title: 'Impresoras y 3D',        subtitle: 'Impresoras, filamentos 3D, resinas y suministros',                 bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)',  accent: '#d48fda' },
}

// ── Subcategorías por categoría (filtros rápidos con keyword) ──────
const SUBCATEGORIES: Record<string, { label: string; q: string }[]> = {
  Notebooks: [
    { label: 'Todas',             q: '' },
    { label: 'Notebooks Gaming',  q: 'gaming' },
    { label: 'Notebooks Trabajo', q: 'trabajo' },
    { label: 'MacBooks',          q: 'macbook' },
    { label: 'Desktops / Mini PC',q: 'mini pc' },
  ],
  Componentes: [
    { label: 'Todos',              q: '' },
    { label: 'Procesadores',       q: 'procesador' },
    { label: 'Placas Madre',       q: 'placa madre' },
    { label: 'Tarjetas Gráficas',  q: 'tarjeta grafica' },
    { label: 'Memorias RAM',       q: 'memoria ram' },
    { label: 'SSD / Almacenamiento', q: 'ssd' },
    { label: 'Fuentes de Poder',   q: 'fuente' },
    { label: 'Gabinetes',          q: 'gabinete' },
    { label: 'Coolers / Watercooling', q: 'cooler' },
  ],
  Gaming: [
    { label: 'Todos',            q: '' },
    { label: 'Teclados',         q: 'teclado' },
    { label: 'Mouses',           q: 'ratón' },
    { label: 'Headsets',         q: 'headset' },
    { label: 'Monitores Gaming', q: 'monitor' },
    { label: 'Controles',        q: 'control' },
    { label: 'Consolas',         q: 'consola' },
    { label: 'Juegos',           q: 'juego' },
    { label: 'Sillas Gaming',    q: 'silla' },
    { label: 'Gabinetes',        q: 'gabinete' },
    { label: 'Mousepad',         q: 'mousepad' },
  ],
  Celulares: [
    { label: 'Todos',          q: '' },
    { label: 'Smartphones',    q: 'smartphone' },
    { label: 'iPhones',        q: 'iphone' },
    { label: 'Samsung',        q: 'samsung' },
    { label: 'Xiaomi',         q: 'xiaomi' },
    { label: 'Tablets',        q: 'tablet' },
    { label: 'Smartwatches',   q: 'smartwatch' },
    { label: 'Cargadores',     q: 'cargador' },
    { label: 'Auriculares',    q: 'auricular' },
  ],
  Monitores: [
    { label: 'Todos',          q: '' },
    { label: 'Monitores 4K',   q: '4k' },
    { label: 'Gaming',         q: 'gaming' },
    { label: 'OLED',           q: 'oled' },
    { label: 'Curvo',          q: 'curvo' },
  ],
  Accesorios: [
    { label: 'Todos',             q: '' },
    { label: 'Perfumes',          q: 'perfume' },
    { label: 'Memorias / USB',    q: 'memoria' },
    { label: 'Auriculares',       q: 'auricular' },
    { label: 'Teclados y Mouses', q: 'teclado' },
    { label: 'Cámaras y Drones',  q: 'cámara' },
    { label: 'Impresoras 3D',     q: 'filamento' },
    { label: 'Smartwatches',      q: 'garmin' },
    { label: 'Pendrive',          q: 'pendrive' },
  ],
  Networking: [
    { label: 'Todos',          q: '' },
    { label: 'Routers',        q: 'router' },
    { label: 'Cámaras IP',     q: 'cámara' },
    { label: 'Smart Home',     q: 'smart' },
    { label: 'Tablets',        q: 'tablet' },
    { label: 'Gafas / Lentes', q: 'gafas' },
    { label: 'Adaptadores',    q: 'adaptador' },
  ],
  Impresoras: [
    { label: 'Todos',          q: '' },
    { label: 'Impresoras',     q: 'impresora' },
    { label: 'Filamentos 3D',  q: 'filamento' },
    { label: 'Resinas',        q: 'resina' },
    { label: 'Cartuchos',      q: 'cartucho' },
  ],
}

const MAIN_CATEGORIES = [
  { label: 'Todos',       value: '' },
  { label: 'Notebooks',   value: 'Notebooks' },
  { label: 'Componentes', value: 'Componentes' },
  { label: 'Gaming',      value: 'Gaming' },
  { label: 'Celulares',   value: 'Celulares' },
  { label: 'Monitores',   value: 'Monitores' },
  { label: 'Accesorios',  value: 'Accesorios' },
  { label: 'Networking',  value: 'Networking' },
  { label: 'Impresoras',  value: 'Impresoras' },
]

const SORT_OPTIONS = [
  { label: 'Más recientes',  value: 'newest' },
  { label: 'Menor precio',   value: 'price_asc' },
  { label: 'Mayor precio',   value: 'price_desc' },
  { label: 'A → Z',          value: 'name_asc' },
  { label: 'Z → A',          value: 'name_desc' },
]

function ProductsPageInner() {
  const searchParams = useSearchParams()

  const [products,     setProducts]     = useState<any[]>([])
  const [total,        setTotal]        = useState(0)
  const [loading,      setLoading]      = useState(true)
  const [page,         setPage]         = useState(1)

  const [selectedCat,  setSelectedCat]  = useState(searchParams.get('category') || '')
  const [search,       setSearch]       = useState(searchParams.get('q') || '')
  const [subSearch,    setSubSearch]    = useState('')   // keyword de subcategoría seleccionada
  const [sort,         setSort]         = useState('newest')
  const [selectedBrand,setSelectedBrand]= useState('')
  const [minPrice,     setMinPrice]     = useState('')
  const [maxPrice,     setMaxPrice]     = useState('')

  // Datos del sidebar dinámico
  const [availBrands,  setAvailBrands]  = useState<{ name: string; count: number }[]>([])
  const [priceRange,   setPriceRange]   = useState({ min: 0, max: 0 })
  const [showSidebar,  setShowSidebar]  = useState(false)

  const catConfig   = CATEGORY_CONFIG[selectedCat]
  const subcats     = SUBCATEGORIES[selectedCat] || []

  // Combinar búsqueda manual + keyword de subcategoría
  const effectiveSearch = subSearch || search

  // Cargar filtros disponibles cuando cambia categoría o búsqueda
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCat)     params.set('category', selectedCat)
    if (effectiveSearch) params.set('q', effectiveSearch)
    fetch(`/api/products/filters?${params}`)
      .then(r => r.json())
      .then(d => {
        setAvailBrands(d.brands || [])
        setPriceRange({ min: d.minPrice || 0, max: d.maxPrice || 0 })
      })
      .catch(() => {})
  }, [selectedCat, effectiveSearch])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (effectiveSearch) params.set('q', effectiveSearch)
    if (selectedCat)     params.set('category', selectedCat)
    if (selectedBrand)   params.set('brand', selectedBrand)
    if (minPrice)        params.set('minPrice', minPrice)
    if (maxPrice)        params.set('maxPrice', maxPrice)
    params.set('sort',  sort)
    params.set('page',  String(page))
    params.set('limit', '24')
    try {
      const res  = await fetch(`/api/products?${params}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.pagination?.total || 0)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [effectiveSearch, selectedCat, selectedBrand, minPrice, maxPrice, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const clearAll = () => {
    setSelectedCat(''); setSearch(''); setSubSearch('')
    setSelectedBrand(''); setMinPrice(''); setMaxPrice('')
    setPage(1)
  }

  const handleCatChange = (cat: string) => {
    setSelectedCat(cat); setSubSearch(''); setSelectedBrand(''); setMinPrice(''); setMaxPrice(''); setPage(1)
  }

  const handleSubcat = (q: string) => {
    setSubSearch(q); setSearch(''); setSelectedBrand(''); setPage(1)
  }

  const totalPages = Math.ceil(total / 24)

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Category Hero ────────────────────────────────────────── */}
      {catConfig ? (
        <div className="relative overflow-hidden" style={{ background: catConfig.bg, minHeight: '140px' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute right-0 top-0 bottom-0 flex items-center select-none pointer-events-none" style={{ fontSize: '180px', opacity: 0.08, paddingRight: '32px' }}>
            {catConfig.emoji}
          </div>
          <div className="relative max-w-7xl mx-auto px-6 py-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {catConfig.emoji}
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: catConfig.accent }}>Categoría</p>
              <h1 className="text-2xl font-black text-white">{catConfig.title}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.65)' }}>{catConfig.subtitle}</p>
            </div>
          </div>
        </div>
      ) : (
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

      {/* ── Top bar ──────────────────────────────────────────────── */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex gap-3 items-center justify-between flex-wrap">
            {/* Search */}
            <form onSubmit={e => { e.preventDefault(); setSubSearch(''); setPage(1) }}
              className="flex items-center gap-2 flex-1 max-w-sm rounded-xl px-3 py-2"
              style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }}>
              <Search size={15} style={{ color: 'var(--text-muted)' }} />
              <input value={search} onChange={e => { setSearch(e.target.value); setSubSearch('') }}
                placeholder="Buscar producto..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--text-primary)' }} />
              {search && <button type="button" onClick={() => setSearch('')}><X size={14} style={{ color: 'var(--text-muted)' }} /></button>}
            </form>

            <div className="flex items-center gap-2 flex-wrap">
              {!loading && <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>{total} productos</span>}

              {/* Sort */}
              <div className="relative">
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1) }}
                  className="appearance-none text-xs font-semibold pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>
                  {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
              </div>

              {/* Toggle sidebar mobile */}
              <button onClick={() => setShowSidebar(s => !s)}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl lg:hidden"
                style={{ border: '1.5px solid var(--border)', background: showSidebar ? 'var(--accent-bg)' : 'white', color: showSidebar ? 'var(--accent)' : 'var(--text-secondary)' }}>
                <SlidersHorizontal size={13} /> Filtros
              </button>

              {(selectedCat || search || selectedBrand || minPrice || maxPrice) && (
                <button onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
                  <X size={12} /> Limpiar todo
                </button>
              )}
            </div>
          </div>

          {/* Category tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 mt-3" style={{ scrollbarWidth: 'none' }}>
            {MAIN_CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => handleCatChange(cat.value)}
                className="shrink-0 text-xs font-bold px-4 py-1.5 rounded-xl transition-all whitespace-nowrap"
                style={{
                  background: selectedCat === cat.value ? 'var(--accent)' : 'white',
                  color:      selectedCat === cat.value ? 'white' : 'var(--text-secondary)',
                  border:     `1.5px solid ${selectedCat === cat.value ? 'var(--accent)' : 'var(--border)'}`,
                }}>
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Layout: sidebar + grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* ── Sidebar ──────────────────────────────────────────── */}
        <aside className={`shrink-0 w-56 space-y-4 ${showSidebar ? 'block' : 'hidden'} lg:block`}>

          {/* Subcategorías */}
          {subcats.length > 1 && (
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Subcategoría</p>
              <div className="space-y-1">
                {subcats.map(s => (
                  <button key={s.q} onClick={() => handleSubcat(s.q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                    style={{
                      background: subSearch === s.q && (s.q !== '' || subSearch === '') ? 'var(--accent-bg)' : 'transparent',
                      color:      subSearch === s.q && (s.q !== '' || subSearch === '') ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: subSearch === s.q ? 700 : 500,
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Marcas */}
          {availBrands.length > 0 && (
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Marca</p>
              <div className="space-y-1 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => { setSelectedBrand(''); setPage(1) }}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
                  style={{ background: !selectedBrand ? 'var(--accent-bg)' : 'transparent', color: !selectedBrand ? 'var(--accent)' : 'var(--text-secondary)' }}>
                  Todas las marcas
                </button>
                {availBrands.map(b => (
                  <button key={b.name} onClick={() => { setSelectedBrand(b.name); setPage(1) }}
                    className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all flex items-center justify-between gap-1"
                    style={{
                      background: selectedBrand === b.name ? 'var(--accent-bg)' : 'transparent',
                      color:      selectedBrand === b.name ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: selectedBrand === b.name ? 700 : 400,
                    }}>
                    <span className="truncate">{b.name}</span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>{b.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rango de precio */}
          {priceRange.max > 0 && (
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Rango de precio (Gs.)</p>
              <div className="space-y-2">
                <input type="number" placeholder={`Mín: ${formatPrice(priceRange.min)}`}
                  value={minPrice} onChange={e => { setMinPrice(e.target.value); setPage(1) }}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input type="number" placeholder={`Máx: ${formatPrice(priceRange.max)}`}
                  value={maxPrice} onChange={e => { setMaxPrice(e.target.value); setPage(1) }}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                {(minPrice || maxPrice) && (
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1) }}
                    className="w-full text-xs py-1.5 rounded-lg"
                    style={{ color: 'var(--accent)', background: 'var(--accent-bg)' }}>
                    Quitar rango
                  </button>
                )}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                Rango: {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}
              </p>
            </div>
          )}

        </aside>

        {/* ── Product grid ────────────────────────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Filtros activos */}
          {(selectedBrand || minPrice || maxPrice || subSearch) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {subSearch && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
                  {subcats.find(s => s.q === subSearch)?.label || subSearch}
                  <button onClick={() => { setSubSearch(''); setPage(1) }}><X size={11} /></button>
                </span>
              )}
              {selectedBrand && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
                  {selectedBrand}
                  <button onClick={() => { setSelectedBrand(''); setPage(1) }}><X size={11} /></button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
                  {minPrice ? formatPrice(parseFloat(minPrice)) : '–'} → {maxPrice ? formatPrice(parseFloat(maxPrice)) : '–'}
                  <button onClick={() => { setMinPrice(''); setMaxPrice(''); setPage(1) }}><X size={11} /></button>
                </span>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--border)' }}>
                  <div className="aspect-square" style={{ background: 'var(--bg-secondary)' }} />
                  <div className="p-3 space-y-2">
                    <div className="h-3 rounded" style={{ background: 'var(--border)', width: '60%' }} />
                    <div className="h-4 rounded" style={{ background: 'var(--border)' }} />
                    <div className="h-6 rounded" style={{ background: 'var(--border)', width: '50%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <p className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Sin resultados</p>
              <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Intentá con otro término o categoría</p>
              <button onClick={clearAll} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10 flex-wrap">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-40"
                    style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>
                    ← Anterior
                  </button>

                  {(() => {
                    const pages = []
                    const start = Math.max(1, page - 2)
                    const end   = Math.min(totalPages, start + 4)
                    for (let n = start; n <= end; n++) pages.push(n)
                    return pages.map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className="w-9 h-9 text-sm font-bold rounded-xl"
                        style={{
                          background: page === n ? 'var(--accent)' : 'white',
                          color:      page === n ? 'white' : 'var(--text-primary)',
                          border:     `1.5px solid ${page === n ? 'var(--accent)' : 'var(--border)'}`,
                        }}>
                        {n}
                      </button>
                    ))
                  })()}

                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-40"
                    style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>
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

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsPageInner />
    </Suspense>
  )
}
