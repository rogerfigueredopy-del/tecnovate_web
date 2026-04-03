'use client'
import { ProductCard } from '@/components/ui/ProductCard'
import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { X, ChevronDown, SlidersHorizontal, Laptop, Cpu, Gamepad2, Smartphone, Monitor, Headphones, Wifi, Printer } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; title: string; subtitle: string; bg: string; accent: string }> = {
  Notebooks:    { icon: Laptop,     title: 'Notebooks',              subtitle: 'Las mejores laptops del mercado — gaming, trabajo y estudio',    bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)', accent: '#b769bd' },
  Componentes:  { icon: Cpu,        title: 'Componentes PC',         subtitle: 'CPUs, GPUs, RAM, almacenamiento y más para armar tu PC',         bg: 'linear-gradient(135deg,#1a0030,#5c1a70)', accent: '#d48fda' },
  Gaming:       { icon: Gamepad2,   title: 'Zona Gaming',            subtitle: 'Equipos y accesorios para llevar tu gaming al siguiente nivel',   bg: 'linear-gradient(135deg,#200838,#6b2177)', accent: '#c47fcb' },
  Celulares:    { icon: Smartphone, title: 'Celulares y Smartphones',subtitle: 'iPhone, Samsung, Xiaomi y más — todos los modelos disponibles',   bg: 'linear-gradient(135deg,#1a0030,#4a0a5c)', accent: '#b769bd' },
  Monitores:    { icon: Monitor,    title: 'Monitores',              subtitle: 'Monitores gaming, profesionales y de oficina — 4K, IPS, OLED',    bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)', accent: '#d48fda' },
  Accesorios:   { icon: Headphones, title: 'Accesorios',             subtitle: 'Teclados, mouses, auriculares, perfumes y mucho más',             bg: 'linear-gradient(135deg,#1a0030,#5c1a70)', accent: '#c47fcb' },
  Networking:   { icon: Wifi,       title: 'Networking',             subtitle: 'Routers, cámaras, smart home y todo para tu red',                 bg: 'linear-gradient(135deg,#200838,#5c1a70)', accent: '#b769bd' },
  Impresoras:   { icon: Printer,    title: 'Impresoras y 3D',        subtitle: 'Impresoras, filamentos 3D, resinas y suministros',                bg: 'linear-gradient(135deg,#2d0a40,#7b2d9e)', accent: '#d48fda' },
}

const SUBCATEGORIES: Record<string, { label: string; q: string }[]> = {
  Notebooks:   [{ label:'Gaming',q:'gaming'},{label:'Trabajo',q:'trabajo'},{label:'MacBooks',q:'macbook'},{label:'Mini PC / Desktop',q:'mini pc'}],
  Componentes: [{ label:'Procesadores',q:'procesador'},{label:'Placas Madre',q:'placa madre'},{label:'Tarjetas Gráficas',q:'tarjeta grafica'},{label:'Memorias RAM',q:'memoria ram'},{label:'SSD / Almacenamiento',q:'ssd'},{label:'Fuentes',q:'fuente'},{label:'Gabinetes',q:'gabinete'},{label:'Coolers',q:'cooler'}],
  Gaming:      [{ label:'Teclados',q:'teclado'},{label:'Mouses',q:'ratón'},{label:'Headsets',q:'headset'},{label:'Monitores',q:'monitor'},{label:'Controles',q:'control'},{label:'Consolas',q:'consola'},{label:'Juegos',q:'juego'},{label:'Sillas',q:'silla'},{label:'Mousepad',q:'mousepad'}],
  Celulares:   [{ label:'Smartphones',q:'smartphone'},{label:'iPhones',q:'iphone'},{label:'Samsung',q:'samsung'},{label:'Xiaomi',q:'xiaomi'},{label:'Tablets',q:'tablet'},{label:'Smartwatches',q:'smartwatch'},{label:'Cargadores',q:'cargador'},{label:'Auriculares',q:'auricular'}],
  Monitores:   [{ label:'4K',q:'4k'},{label:'Gaming',q:'gaming'},{label:'OLED',q:'oled'},{label:'Curvo',q:'curvo'}],
  Accesorios:  [{ label:'Perfumes',q:'perfume'},{label:'Memorias / USB',q:'memoria'},{label:'Auriculares',q:'auricular'},{label:'Teclados y Mouses',q:'teclado'},{label:'Cámaras y Drones',q:'cámara'},{label:'Impresoras 3D',q:'filamento'},{label:'Smartwatches',q:'smartwatch'},{label:'Pendrive',q:'pendrive'}],
  Networking:  [{ label:'Routers',q:'router'},{label:'Cámaras IP',q:'cámara'},{label:'Smart Home',q:'smart'},{label:'Tablets',q:'tablet'},{label:'Adaptadores',q:'adaptador'}],
  Impresoras:  [{ label:'Impresoras',q:'impresora'},{label:'Filamentos 3D',q:'filamento'},{label:'Resinas',q:'resina'},{label:'Cartuchos',q:'cartucho'}],
}

const SORT_OPTIONS = [
  { label: 'Más recientes', value: 'newest'     },
  { label: 'Menor precio',  value: 'price_asc'  },
  { label: 'Mayor precio',  value: 'price_desc' },
  { label: 'A → Z',         value: 'name_asc'   },
  { label: 'Z → A',         value: 'name_desc'  },
]

// ─── Helper: construye URL de productos con parámetros dados ────────────────
function buildUrl(params: Record<string, string | undefined>) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => { if (v) sp.set(k, v) })
  return `/products?${sp.toString()}`
}

function ProductsPageInner() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  // ── Leer TODO desde la URL — fuente única de verdad ──────────────
  const category = searchParams.get('category') || ''
  const q        = searchParams.get('q')        || ''
  const brand    = searchParams.get('brand')    || ''
  const minPrice = searchParams.get('minPrice') || ''
  const maxPrice = searchParams.get('maxPrice') || ''
  const sort     = searchParams.get('sort')     || 'newest'
  const page     = parseInt(searchParams.get('page') || '1')

  // ── Estado local solo para datos del servidor ─────────────────────
  const [products,    setProducts]    = useState<any[]>([])
  const [total,       setTotal]       = useState(0)
  const [loading,     setLoading]     = useState(true)
  const [availBrands, setAvailBrands] = useState<{ name: string; count: number }[]>([])
  const [priceRange,  setPriceRange]  = useState({ min: 0, max: 0 })
  const [showSidebar, setShowSidebar] = useState(false)

  const catConfig = CATEGORY_CONFIG[category]
  const subcats   = SUBCATEGORIES[category] || []

  // ── Actualizar URL manteniendo todos los parámetros actuales ──────
  const setParam = useCallback((key: string, value: string) => {
    const current: Record<string, string | undefined> = {
      category: searchParams.get('category') || undefined,
      q:        searchParams.get('q')        || undefined,
      brand:    searchParams.get('brand')    || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      sort:     searchParams.get('sort')     || undefined,
    }
    current[key] = value || undefined
    delete current['page'] // reset página al cambiar filtros
    router.push(buildUrl(current), { scroll: false })
  }, [searchParams, router])

  const setPage = (p: number) => {
    const current: Record<string, string | undefined> = {
      category: category || undefined,
      q:        q        || undefined,
      brand:    brand    || undefined,
      minPrice: minPrice || undefined,
      maxPrice: maxPrice || undefined,
      sort:     sort !== 'newest' ? sort : undefined,
      page:     p > 1 ? String(p) : undefined,
    }
    router.push(buildUrl(current), { scroll: false })
  }

  // ── Cargar filtros disponibles ────────────────────────────────────
  useEffect(() => {
    const sp = new URLSearchParams()
    if (category) sp.set('category', category)
    if (q)        sp.set('q', q)
    fetch(`/api/products/filters?${sp}`)
      .then(r => r.json())
      .then(d => {
        setAvailBrands(d.brands || [])
        setPriceRange({ min: d.minPrice || 0, max: d.maxPrice || 0 })
      })
      .catch(() => {})
  }, [category, q])

  // ── Cargar productos ──────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true)
    const sp = new URLSearchParams()
    if (category) sp.set('category', category)
    if (q)        sp.set('q', q)
    if (brand)    sp.set('brand', brand)
    if (minPrice) sp.set('minPrice', minPrice)
    if (maxPrice) sp.set('maxPrice', maxPrice)
    sp.set('sort',  sort)
    sp.set('page',  String(page))
    sp.set('limit', '24')
    try {
      const res  = await fetch(`/api/products?${sp}`)
      const data = await res.json()
      setProducts(data.products || [])
      setTotal(data.pagination?.total || 0)
    } catch { setProducts([]) }
    finally { setLoading(false) }
  }, [category, q, brand, minPrice, maxPrice, sort, page])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const clearAll = () => router.push('/products')

  const totalPages = Math.ceil(total / 24)
  const activeFilters = [
    q        && { key: 'q',        label: `"${q}"` },
    brand    && { key: 'brand',    label: brand },
    (minPrice || maxPrice) && { key: 'price', label: `${minPrice ? formatPrice(parseFloat(minPrice)) : '–'} → ${maxPrice ? formatPrice(parseFloat(maxPrice)) : '–'}` },
  ].filter(Boolean) as { key: string; label: string }[]

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Hero de categoría ───────────────────────────────────── */}
      {catConfig ? (
        <div className="relative overflow-hidden" style={{ background: catConfig.bg, minHeight: '140px' }}>
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
          <div className="absolute right-0 top-0 bottom-0 flex items-center select-none pointer-events-none" style={{ opacity: 0.06, paddingRight: '20px' }}>
            <catConfig.icon size={200} strokeWidth={0.8} color="white" />
          </div>
          <div className="relative max-w-7xl mx-auto px-6 py-10 flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <catConfig.icon size={26} strokeWidth={1.5} color={catConfig.accent} />
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
              {q ? `Resultados para "${q}"` : 'Todos los Productos'}
            </h1>
          </div>
        </div>
      )}

      {/* ── Barra de controles ──────────────────────────────────── */}
      <div className="bg-white border-b sticky top-16 z-30 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap justify-between">

          <div className="flex items-center gap-2 flex-wrap">
            {!loading && (
              <span className="text-xs px-2 py-1 rounded-lg font-semibold" style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {total.toLocaleString()} productos
              </span>
            )}
            {/* Filtros activos como tags */}
            {activeFilters.map(f => (
              <span key={f.key} className="flex items-center gap-1 text-xs px-3 py-1 rounded-full font-bold"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
                {f.label}
                <button onClick={() => {
                  if (f.key === 'q')     setParam('q', '')
                  if (f.key === 'brand') setParam('brand', '')
                  if (f.key === 'price') {
                    const current: Record<string, string | undefined> = {
                      category: category || undefined, q: q || undefined,
                      brand: brand || undefined, sort: sort !== 'newest' ? sort : undefined,
                    }
                    router.push(buildUrl(current), { scroll: false })
                  }
                }}><X size={11} /></button>
              </span>
            ))}
            {(activeFilters.length > 0 || category) && (
              <button onClick={clearAll} className="text-xs font-semibold px-2 py-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                Limpiar todo
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Ordenar */}
            <div className="relative">
              <select value={sort} onChange={e => setParam('sort', e.target.value)}
                className="appearance-none text-xs font-semibold pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
            </div>
            {/* Toggle sidebar en mobile */}
            <button onClick={() => setShowSidebar(s => !s)}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl lg:hidden"
              style={{ border: '1.5px solid var(--border)', background: showSidebar ? 'var(--accent-bg)' : 'white', color: showSidebar ? 'var(--accent)' : 'var(--text-secondary)' }}>
              <SlidersHorizontal size={13} /> Filtros
            </button>
          </div>
        </div>
      </div>

      {/* ── Layout: sidebar + grid ───────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6 flex gap-6 items-start">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className={`shrink-0 w-52 space-y-4 ${showSidebar ? 'block' : 'hidden'} lg:block`}>

          {/* Subcategorías */}
          {subcats.length > 0 && (
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Subcategoría</p>
              <div className="space-y-0.5">
                <button onClick={() => setParam('q', '')}
                  className="w-full text-left text-xs px-3 py-2 rounded-lg font-semibold transition-all"
                  style={{ background: !q ? 'var(--accent-bg)' : 'transparent', color: !q ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: !q ? 700 : 500 }}>
                  Todas
                </button>
                {subcats.map(s => (
                  <button key={s.q} onClick={() => setParam('q', s.q)}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg transition-all"
                    style={{ background: q === s.q ? 'var(--accent-bg)' : 'transparent', color: q === s.q ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: q === s.q ? 700 : 400 }}>
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
              <div className="space-y-0.5 max-h-60 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
                <button onClick={() => setParam('brand', '')}
                  className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: !brand ? 'var(--accent-bg)' : 'transparent', color: !brand ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: !brand ? 700 : 400 }}>
                  Todas
                </button>
                {availBrands.map(b => (
                  <button key={b.name} onClick={() => setParam('brand', b.name)}
                    className="w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all flex items-center justify-between gap-1"
                    style={{ background: brand === b.name ? 'var(--accent-bg)' : 'transparent', color: brand === b.name ? 'var(--accent)' : 'var(--text-secondary)', fontWeight: brand === b.name ? 700 : 400 }}>
                    <span className="truncate">{b.name}</span>
                    <span className="shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>{b.count}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rango de precio */}
          {priceRange.max > 0 && (
            <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Precio (Gs.)</p>
              <div className="space-y-2">
                <input type="number" placeholder={`Mín`}
                  defaultValue={minPrice}
                  key={`min-${category}-${q}`}
                  onBlur={e => setParam('minPrice', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setParam('minPrice', (e.target as HTMLInputElement).value)}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <input type="number" placeholder={`Máx`}
                  defaultValue={maxPrice}
                  key={`max-${category}-${q}`}
                  onBlur={e => setParam('maxPrice', e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setParam('maxPrice', (e.target as HTMLInputElement).value)}
                  className="w-full text-xs px-3 py-2 rounded-lg outline-none"
                  style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {formatPrice(priceRange.min)} — {formatPrice(priceRange.max)}
                </p>
              </div>
            </div>
          )}
        </aside>

        {/* ── Grid de productos ────────────────────────────────── */}
        <div className="flex-1 min-w-0">
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
              <p className="text-sm mt-1 mb-6" style={{ color: 'var(--text-muted)' }}>Intentá con otro término o filtro</p>
              <button onClick={clearAll} className="px-6 py-2.5 rounded-xl text-white text-sm font-bold" style={{ background: 'var(--accent)' }}>
                Ver todos los productos
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((p: any) => <ProductCard key={p.id} product={p} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10 flex-wrap">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
                    className="px-4 py-2 text-sm font-bold rounded-xl disabled:opacity-40"
                    style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}>
                    ← Anterior
                  </button>
                  {(() => {
                    const start = Math.max(1, page - 2)
                    const end   = Math.min(totalPages, start + 4)
                    return Array.from({ length: end - start + 1 }, (_, i) => start + i).map(n => (
                      <button key={n} onClick={() => setPage(n)}
                        className="w-9 h-9 text-sm font-bold rounded-xl"
                        style={{ background: page === n ? 'var(--accent)' : 'white', color: page === n ? 'white' : 'var(--text-primary)', border: `1.5px solid ${page === n ? 'var(--accent)' : 'var(--border)'}` }}>
                        {n}
                      </button>
                    ))
                  })()}
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages}
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
  return <Suspense><ProductsPageInner /></Suspense>
}
