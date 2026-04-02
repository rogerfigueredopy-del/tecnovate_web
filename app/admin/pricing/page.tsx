'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { Tag, Percent, Package, Layers, CheckSquare, Loader2, TrendingUp, Search, RotateCcw, BarChart3, AlertTriangle, DollarSign, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Notebooks','Componentes','Gaming','Celulares','Monitores','Accesorios','Networking','Impresoras']

export default function PricingPage() {
  const [scope,        setScope]        = useState<'all'|'category'|'products'>('all')
  const [categoryName, setCategoryName] = useState('Celulares')
  const [marginPct,    setMarginPct]    = useState('')
  const [discountPct,  setDiscountPct]  = useState('')
  const [loading,      setLoading]      = useState(false)
  const [searchTerm,   setSearchTerm]   = useState('')
  const [products,     setProducts]     = useState<any[]>([])
  const [selected,     setSelected]     = useState<string[]>([])
  const [loadingProds, setLoadingProds] = useState(false)
  const [stats,        setStats]        = useState<any>(null)
  const [exchangeRate, setExchangeRate] = useState<any>(null)
  const [rateInput,    setRateInput]    = useState('')
  const [loadingRate,  setLoadingRate]  = useState(false)

  const loadExchangeRate = useCallback(async () => {
    try {
      const res  = await fetch('/api/exchange-rate')
      const data = await res.json()
      setExchangeRate(data)
      setRateInput(String(data.rate))
    } catch {}
  }, [])

  useEffect(() => { loadExchangeRate() }, [loadExchangeRate])

  const handleSaveRate = async () => {
    setLoadingRate(true)
    try {
      const res  = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: parseFloat(rateInput) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.message}`)
      loadExchangeRate()
    } catch (e: any) { toast.error(e.message) }
    finally { setLoadingRate(false) }
  }

  const handleAutoRate = async () => {
    setLoadingRate(true)
    try {
      const res  = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: null }), // elimina manual → auto
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.message}`)
      loadExchangeRate()
    } catch (e: any) { toast.error(e.message) }
    finally { setLoadingRate(false) }
  }

  const loadStats = useCallback(async () => {
    try {
      const res  = await fetch('/api/admin/pricing')
      const data = await res.json()
      setStats(data)
    } catch {}
  }, [])

  useEffect(() => { loadStats() }, [loadStats])

  useEffect(() => {
    if (scope !== 'products') return
    setLoadingProds(true)
    const q = searchTerm ? `&q=${encodeURIComponent(searchTerm)}` : ''
    fetch(`/api/products?limit=50${q}`)
      .then(r => r.json())
      .then(d => setProducts(d.products || []))
      .finally(() => setLoadingProds(false))
  }, [scope, searchTerm])

  // Preview en tiempo real
  const exampleBase = 100000
  const margin   = parseFloat(marginPct)  || 0
  const discount = parseFloat(discountPct) || 0
  const withMargin = Math.round(exampleBase * (1 + margin / 100))
  const oldPrice   = discount > 0 ? Math.round(withMargin / (1 - discount / 100)) : null

  const scopeLabel = scope === 'all' ? 'todos los productos' : scope === 'category' ? categoryName : `${selected.length} productos`

  const handleApply = async () => {
    if (!marginPct && !discountPct) return toast.error('Ingresá al menos un margen o descuento')
    if (scope === 'products' && !selected.length) return toast.error('Seleccioná al menos un producto')
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          categoryName: scope === 'category' ? categoryName : undefined,
          productIds:   scope === 'products'  ? selected      : undefined,
          marginPct:    marginPct  ? parseFloat(marginPct)  : 0,
          discountPct:  discountPct ? parseFloat(discountPct) : 0,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.message}`)
      setSelected([])
      loadStats()
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar')
    } finally {
      setLoading(false)
    }
  }

  const handleResetDiscounts = async () => {
    if (!confirm('¿Eliminar todos los precios tachados (descuentos visibles)?')) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scope, categoryName: scope === 'category' ? categoryName : undefined, resetPrices: true }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.message}`)
      loadStats()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const handleResetToBase = async () => {
    const scopeTxt = scope === 'all' ? 'TODOS los productos' : scope === 'category' ? `categoría ${categoryName}` : `${selected.length} productos`
    if (!confirm(`¿Volver al precio base (sin margen) para ${scopeTxt}?\nEsto eliminará el margen aplicado y los descuentos.`)) return
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scope,
          categoryName: scope === 'category' ? categoryName : undefined,
          productIds:   scope === 'products'  ? selected      : undefined,
          resetToBase: true,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success(`✓ ${data.message}`)
      setSelected([])
      loadStats()
    } catch (e: any) {
      toast.error(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  const marginColor = stats?.avgMargin > 0 ? 'var(--accent)' : stats?.avgMargin < 0 ? '#dc2626' : 'var(--text-secondary)'

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Gestión de Precios</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Márgenes y descuentos por categoría o producto</p>
          </div>
          <TrendingUp size={28} style={{ color: 'var(--accent)' }} />
        </div>
      </div>

      <div className="p-8 max-w-4xl space-y-5">

        {/* Stats actuales */}
        {stats && (
          <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 size={16} style={{ color: 'var(--accent)' }} />
              <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Estado actual de precios</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Productos activos',   value: stats.total?.toLocaleString() },
                { label: 'Con descuento',        value: stats.withDiscount?.toLocaleString() },
                { label: 'Precio promedio',      value: formatPrice(stats.avgPrice) },
                { label: 'Precio máximo',        value: formatPrice(stats.maxPrice) },
              ].map(s => (
                <div key={s.label} className="rounded-xl p-3 text-center" style={{ background: 'var(--accent-bg)' }}>
                  <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                  <p className="font-black text-sm" style={{ color: 'var(--accent)' }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Margen actual aplicado */}
            <div className="mt-4 rounded-xl p-4" style={{ background: stats.avgMargin !== 0 ? '#fef9c3' : 'var(--bg-secondary)', border: `1.5px solid ${stats.avgMargin !== 0 ? '#fde047' : 'var(--border)'}` }}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {stats.avgMargin !== 0 && <AlertTriangle size={15} style={{ color: '#ca8a04' }} />}
                  <p className="text-xs font-black" style={{ color: 'var(--text-secondary)' }}>
                    Margen promedio aplicado actualmente
                  </p>
                </div>
                <p className="text-xl font-black" style={{ color: marginColor }}>
                  {stats.avgMargin > 0 ? '+' : ''}{stats.avgMargin}%
                </p>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Calculado sobre {stats.productsWithBase?.toLocaleString()} productos con precio base registrado.
                {stats.avgMargin !== 0 && ' Podés modificarlo o volver al precio base con los botones de abajo.'}
              </p>
            </div>
          </div>
        )}

        {/* Tipo de cambio */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 mb-4">
            <DollarSign size={16} style={{ color: 'var(--accent)' }} />
            <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Tipo de cambio USD / Gs.</h3>
            {exchangeRate && (
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-black"
                style={{ background: exchangeRate.source === 'manual' ? '#fef9c3' : 'var(--accent-bg)', color: exchangeRate.source === 'manual' ? '#92400e' : 'var(--accent)' }}>
                {exchangeRate.source === 'manual' ? 'Manual' : 'Auto'}
              </span>
            )}
          </div>
          <div className="flex gap-3 items-end flex-wrap">
            <div className="flex-1" style={{ minWidth: 180 }}>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                1 USD = ? Gs. (guaraníes)
              </label>
              <input type="number" min="1000" max="20000" step="10"
                value={rateInput} onChange={e => setRateInput(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none font-black"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Ingresá el mismo valor que muestra Atacado Connect
              </p>
            </div>
            <button onClick={handleSaveRate} disabled={loadingRate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {loadingRate ? <Loader2 size={14} className="animate-spin" /> : <DollarSign size={14} />}
              Guardar
            </button>
            <button onClick={handleAutoRate} disabled={loadingRate}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)' }}
              title="Volver a tasa automática de mercado">
              <RefreshCw size={14} />
              Auto
            </button>
          </div>
        </div>

        {/* Cómo funciona */}
        <div className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3" style={{ color: 'var(--text-primary)' }}>¿Cómo funciona?</h3>
          <div className="grid grid-cols-3 gap-3 text-xs">
            {[
              { n:'1', t:'Precio base', d:'Precio de Atacado con -5% ya aplicado' },
              { n:'2', t:'+ Tu margen', d:'Agregás tu ganancia sobre el precio base' },
              { n:'3', t:'+ Descuento', d:'Opcional: tachado para simular oferta' },
            ].map(s => (
              <div key={s.n} className="rounded-xl p-3" style={{ background: 'var(--bg-secondary)' }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white mb-2"
                  style={{ background: 'var(--accent)' }}>{s.n}</div>
                <p className="font-black mb-0.5" style={{ color: 'var(--text-primary)' }}>{s.t}</p>
                <p style={{ color: 'var(--text-muted)' }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-4" style={{ color: 'var(--text-primary)' }}>¿A qué productos aplicar?</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { value:'all',      icon:Layers,       label:'Todos',         desc:'Todos los productos' },
              { value:'category', icon:Tag,           label:'Por categoría', desc:'Una categoría entera' },
              { value:'products', icon:CheckSquare,   label:'Selección',     desc:'Productos específicos' },
            ].map(({ value, icon:Icon, label, desc }) => (
              <button key={value} onClick={() => setScope(value as any)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  border:     scope === value ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                  background: scope === value ? 'var(--accent-bg)' : 'white',
                }}>
                <Icon size={20} style={{ color: scope === value ? 'var(--accent)' : 'var(--text-muted)' }} className="mb-2" />
                <p className="font-black text-sm" style={{ color: scope === value ? 'var(--accent)' : 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </button>
            ))}
          </div>

          {scope === 'category' && (
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setCategoryName(cat)}
                  className="px-4 py-2 rounded-xl text-xs font-black transition-all"
                  style={{
                    background: categoryName === cat ? 'var(--accent)' : 'var(--bg-secondary)',
                    color:      categoryName === cat ? 'white' : 'var(--text-secondary)',
                    border:     `1.5px solid ${categoryName === cat ? 'var(--accent)' : 'var(--border)'}`,
                  }}>
                  {cat}
                </button>
              ))}
            </div>
          )}

          {scope === 'products' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 rounded-xl px-3 py-2.5"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)' }}>
                <Search size={14} style={{ color: 'var(--text-muted)' }} />
                <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Buscar producto..." className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }} />
              </div>
              {selected.length > 0 && (
                <p className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                  {selected.length} seleccionados
                  <button onClick={() => setSelected([])} className="ml-2 underline" style={{ color: 'var(--text-muted)' }}>
                    Limpiar
                  </button>
                </p>
              )}
              <div className="max-h-56 overflow-y-auto space-y-1.5">
                {loadingProds
                  ? <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin" style={{ color: 'var(--accent)' }} /></div>
                  : products.map(p => (
                    <div key={p.id} onClick={() => setSelected(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        border:     selected.includes(p.id) ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                        background: selected.includes(p.id) ? 'var(--accent-bg)' : 'white',
                      }}>
                      <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shrink-0"
                        style={{ background: 'var(--bg-secondary)' }}>
                        {p.images?.[0]
                          ? <img src={p.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                          : <Package size={12} style={{ color: 'var(--text-muted)' }} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                        <p className="text-xs" style={{ color: 'var(--accent)' }}>{formatPrice(p.price)}</p>
                      </div>
                      <div className="w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0"
                        style={{ borderColor: selected.includes(p.id) ? 'var(--accent)' : 'var(--border)', background: selected.includes(p.id) ? 'var(--accent)' : 'white' }}>
                        {selected.includes(p.id) && <div className="w-2 h-2 bg-white rounded-sm" />}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>

        {/* Configurar precios */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>Configurar precios</h2>

          <div className="grid grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Margen de ganancia %
              </label>
              <input type="number" min="0" max="500" step="1"
                value={marginPct} onChange={e => setMarginPct(e.target.value)}
                placeholder={stats?.avgMargin != null ? `Actual: ${stats.avgMargin}%` : 'Ej: 20 (= +20%)'}
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Siempre calculado desde el precio base
              </p>
            </div>
            <div>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Descuento visible %
              </label>
              <input type="number" min="0" max="90" step="1"
                value={discountPct} onChange={e => setDiscountPct(e.target.value)}
                placeholder="Ej: 15 (= -15%)"
                className="w-full rounded-xl px-3 py-2.5 text-sm outline-none"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>0 = sin precio tachado</p>
            </div>
          </div>

          {/* Preview */}
          {(marginPct || discountPct) && (
            <div className="rounded-2xl p-4 mb-5" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light,#e8d0f0)' }}>
              <p className="text-xs font-black mb-3" style={{ color: 'var(--accent)' }}>
                PREVIEW — Ejemplo con precio base Gs. {formatPrice(exampleBase)}
              </p>
              <div className="flex items-center gap-5 flex-wrap">
                <div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Base</p>
                  <p className="text-sm font-black" style={{ color: 'var(--text-secondary)' }}>{formatPrice(exampleBase)}</p>
                </div>
                {margin > 0 && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Con +{marginPct}%</p>
                      <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{formatPrice(withMargin)}</p>
                    </div>
                  </>
                )}
                {discount > 0 && oldPrice && (
                  <>
                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                    <div>
                      <p className="text-xs mb-0.5" style={{ color: 'var(--text-muted)' }}>Se muestra así</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(oldPrice)}</p>
                        <p className="text-base font-black" style={{ color: 'var(--accent)' }}>{formatPrice(withMargin)}</p>
                        <span className="text-xs font-black px-1.5 py-0.5 rounded text-white" style={{ background: '#dc2626' }}>-{discountPct}%</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Botones */}
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleApply} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ background: 'var(--accent)', minWidth: 160 }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Aplicando...</> : <><Percent size={16} />Aplicar a {scopeLabel}</>}
            </button>
            <button onClick={handleResetToBase} disabled={loading}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ border: '1.5px solid #dc2626', background: '#fef2f2', color: '#dc2626' }}
              title="Volver al precio base (sin margen ni descuento)">
              <RotateCcw size={16} />
              Volver al precio base
            </button>
            <button onClick={handleResetDiscounts} disabled={loading}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl font-black text-sm transition-all hover:opacity-90 disabled:opacity-60"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)' }}
              title="Eliminar solo los precios tachados (descuentos visibles)">
              <RotateCcw size={14} />
              Solo descuentos
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
