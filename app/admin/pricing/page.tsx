'use client'
import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { Tag, Percent, Package, Layers, CheckSquare, Loader2, TrendingUp, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Notebooks','Componentes','Gaming','Celulares','Monitores','Accesorios','Networking','Impresoras']

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
const inputSty = { border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }

export default function PricingPage() {
  const [scope,        setScope]        = useState<'all' | 'category' | 'products'>('category')
  const [categoryName, setCategoryName] = useState('Celulares')
  const [marginPct,    setMarginPct]    = useState('')
  const [discountPct,  setDiscountPct]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [preview,      setPreview]      = useState<any>(null)
  const [searchTerm,   setSearchTerm]   = useState('')
  const [products,     setProducts]     = useState<any[]>([])
  const [selected,     setSelected]     = useState<string[]>([])
  const [loadingProds, setLoadingProds] = useState(false)

  // Cargar productos para selección individual
  useEffect(() => {
    if (scope !== 'products') return
    setLoadingProds(true)
    const q = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''
    fetch(`/api/products?limit=50${q}`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoadingProds(false))
  }, [scope, searchTerm])

  // Preview del precio
  const calcPreview = (base: number) => {
    const margin   = parseFloat(marginPct)  || 0
    const discount = parseFloat(discountPct) || 0
    const withMargin = Math.round(base * (1 + margin / 100))
    const oldPrice   = discount > 0 ? Math.round(withMargin / (1 - discount / 100)) : null
    return { base, withMargin, oldPrice }
  }

  const handleApply = async () => {
    if (!marginPct && !discountPct) {
      toast.error('Ingresá al menos un margen o descuento')
      return
    }
    if (scope === 'products' && !selected.length) {
      toast.error('Seleccioná al menos un producto')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          categoryName: scope === 'category' ? categoryName : undefined,
          productIds:   scope === 'products'  ? selected      : undefined,
          marginPct:    marginPct  ? parseFloat(marginPct)  : undefined,
          discountPct:  discountPct ? parseFloat(discountPct) : undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.updated} productos actualizados`)
      setSelected([])
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (id: string) => {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  // Preview en tiempo real con precio de ejemplo
  const exampleBase = 100000
  const prev = calcPreview(exampleBase)

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Gestión de Precios
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Aplicá márgenes y descuentos por categoría o productos individuales
            </p>
          </div>
          <TrendingUp size={28} style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      <div className="p-8 max-w-4xl space-y-6">

        {/* ── Cómo funciona ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
            ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { n: '1', t: 'Precio base',     d: 'Precio de Atacado con -5% ya aplicado (interno)' },
              { n: '2', t: '+ Tu margen',     d: 'Agregás tu ganancia sobre el precio base' },
              { n: '3', t: '+ Descuento',     d: 'Opcional: mostrás un tachado para simular oferta' },
            ].map(s => (
              <div key={s.n} className="rounded-xl p-3" style={{ background: 'var(--accent-bg)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mb-2"
                  style={{ background: 'var(--accent)' }}>{s.n}</div>
                <p className="font-black" style={{ color: 'var(--text-primary)' }}>{s.t}</p>
                <p className="mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Scope ────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-4" style={{ color: 'var(--text-primary)' }}>
            ¿A qué productos aplicar?
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: 'all',      icon: Layers,       label: 'Todos',          desc: 'Todos los productos' },
              { value: 'category', icon: Tag,           label: 'Por categoría',  desc: 'Una categoría entera' },
              { value: 'products', icon: CheckSquare,   label: 'Selección',      desc: 'Productos específicos' },
            ].map(({ value, icon: Icon, label, desc }) => (
              <button key={value} onClick={() => setScope(value as any)}
                className="p-4 rounded-xl text-left transition-all hover:scale-[1.02]"
                style={{
                  border: scope === value ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                  background: scope === value ? 'var(--accent-bg)' : 'white',
                }}>
                <Icon size={20} style={{ color: scope === value ? 'var(--accent)' : 'var(--text-muted)' }} className="mb-2" />
                <p className="font-black text-sm" style={{ color: scope === value ? 'var(--accent)' : 'var(--text-primary)' }}>
                  {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </button>
            ))}
          </div>

          {/* Categoría selector */}
          {scope === 'category' && (
            <div className="mt-4">
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCategoryName(cat)}
                    className="px-4 py-2 rounded-xl text-xs font-black transition-all"
                    style={{
                      background: categoryName === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                      color: categoryName === cat ? 'white' : 'var(--text-secondary)',
                      border: `1.5px solid ${categoryName === cat ? 'var(--accent)' : 'var(--border)'}`,
                    }}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Selección de productos */}
          {scope === 'products' && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto..." className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }} />
              </div>

              {selected.length > 0 && (
                <p className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                  {selected.length} producto{selected.length !== 1 ? 's' : ''} seleccionado{selected.length !== 1 ? 's' : ''}
                  <button onClick={() => setSelected([])} className="ml-2 underline" style={{ color: 'var(--text-muted)' }}>
                    Limpiar
                  </button>
                </p>
              )}

              <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                {loadingProds ? (
                  <div className="flex justify-center py-8">
                    <Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} />
                  </div>
                ) : products.map(p => (
                  <div key={p.id} onClick={() => toggleProduct(p.id)}
                    className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      border: selected.includes(p.id) ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                      background: selected.includes(p.id) ? 'var(--accent-bg)' : 'white',
                    }}>
                    <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--bg-secondary)' }}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                        : <Package size={12} style={{ color: 'var(--text-muted)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {p.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--accent)' }}>{formatPrice(p.price)}</p>
                    </div>
                    <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0"
                      style={{
                        borderColor: selected.includes(p.id) ? 'var(--accent)' : 'var(--border)',
                        background:  selected.includes(p.id) ? 'var(--accent)' : 'white',
                      }}>
                      {selected.includes(p.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Margen y descuento ───────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>
            Configurar precios
          </h2>

          <div className="grid grid-cols-2 gap-5 mb-6">
            {/* Margen */}
            <div>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Margen de ganancia %
              </label>
              <div className="relative">
                <TrendingUp size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type="number" min="0" max="500" step="1"
                  value={marginPct} onChange={e => setMarginPct(e.target.value)}
                  placeholder="Ej: 20 (= +20%)"
                  className={`${inputCls} pl-9`} style={inputSty}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                0 = sin cambio en precio base
              </p>
            </div>

            {/* Descuento */}
            <div>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Descuento visible %
              </label>
              <div className="relative">
                <Percent size={15} className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }} />
                <input type="number" min="0" max="90" step="1"
                  value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                  placeholder="Ej: 15 (= -15%)"
                  className={`${inputCls} pl-9`} style={inputSty}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--border)')} />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                0 = sin precio tachado
              </p>
            </div>
          </div>

          {/* Preview */}
          {(marginPct || discountPct) && (
            <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              <p className="text-xs font-black mb-3" style={{ color: 'var(--accent)' }}>
                PREVIEW — Ejemplo con precio base Gs. {formatPrice(exampleBase)}
              </p>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Precio base</p>
                  <p className="text-sm font-black" style={{ color: 'var(--text-secondary)' }}>
                    {formatPrice(prev.base)}
                  </p>
                </div>
                {marginPct && parseFloat(marginPct) > 0 && (
                  <>
                    <div style={{ color: 'var(--text-muted)' }}>→</div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Con margen +{marginPct}%</p>
                      <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                        {formatPrice(prev.withMargin)}
                      </p>
                    </div>
                  </>
                )}
                {discountPct && parseFloat(discountPct) > 0 && (
                  <>
                    <div style={{ color: 'var(--text-muted)' }}>→</div>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>En la tienda se ve</p>
                      <div className="flex items-center gap-2">
                        {prev.oldPrice && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                            {formatPrice(prev.oldPrice)}
                          </p>
                        )}
                        <p className="text-base font-black" style={{ color: 'var(--accent)' }}>
                          {formatPrice(prev.withMargin)}
                        </p>
                        <span className="text-xs font-black px-1.5 py-0.5 rounded text-white"
                          style={{ background: '#dc2626' }}>
                          -{discountPct}%
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Botón aplicar */}
          <button onClick={handleApply} disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}>
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Aplicando...</>
              : <>
                  <Percent size={16} />
                  Aplicar a {scope === 'all' ? 'todos los productos' : scope === 'category' ? categoryName : `${selected.length} productos`}
                </>
            }
          </button>
        </div>

      </div>
    </div>
  )
}
