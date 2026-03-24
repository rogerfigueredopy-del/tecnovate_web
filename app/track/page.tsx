'use client'
import { useState } from 'react'
import { Search, Package, Truck, CheckCircle, Clock, MapPin, Phone, AlertCircle } from 'lucide-react'

const STATUS_STEPS = [
  { key: 'PENDING',    label: 'Pedido recibido',    icon: Package,      desc: 'Tu pedido fue recibido y está siendo procesado.' },
  { key: 'PAID',       label: 'Pago confirmado',    icon: CheckCircle,  desc: 'El pago fue verificado exitosamente.' },
  { key: 'PROCESSING', label: 'Preparando envío',   icon: Clock,        desc: 'Estamos preparando tu pedido para el envío.' },
  { key: 'SHIPPED',    label: 'En camino',           icon: Truck,        desc: 'Tu pedido está en camino a tu dirección.' },
  { key: 'DELIVERED',  label: '¡Entregado!',         icon: MapPin,       desc: 'Tu pedido fue entregado correctamente.' },
]

const STATUS_ORDER = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']

export default function TrackPage() {
  const [orderId, setOrderId] = useState('')
  const [phone, setPhone] = useState('')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return
    setLoading(true)
    setError('')
    setOrder(null)
    try {
      const res = await fetch(`/api/orders/${orderId.trim()}`)
      if (!res.ok) throw new Error('not_found')
      const data = await res.json()
      setOrder(data)
    } catch {
      setError('No encontramos un pedido con ese número. Verificá el ID e intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const currentStep = order ? STATUS_ORDER.indexOf(order.status) : -1

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-2xl mx-auto px-6 text-center text-white">
          <div className="text-5xl mb-4">📦</div>
          <h1 className="text-3xl font-black mb-2">Rastrear mi pedido</h1>
          <p className="opacity-80 text-sm">Ingresá el número de pedido para ver el estado en tiempo real</p>
        </div>
      </section>

      {/* ── Buscador ─────────────────────────────────────── */}
      <div className="max-w-xl mx-auto px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl p-6 shadow-lg" style={{ border: '1px solid var(--border)' }}>
          <form onSubmit={handleTrack} className="space-y-3">
            <div>
              <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Número de pedido *
              </label>
              <input
                required
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                placeholder="Ej: cm1abc2def3ghi"
                className="w-full rounded-xl px-4 py-3 text-sm font-mono outline-none transition-colors"
                style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={e => (e.target.style.borderColor = 'var(--border)')}
              />
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                Lo encontrás en tu email de confirmación o en "Mis Pedidos"
              </p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {loading
                ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                : <><Search size={15} /> Rastrear pedido</>
              }
            </button>
          </form>
        </div>
      </div>

      {/* ── Error ────────────────────────────────────────── */}
      {error && (
        <div className="max-w-xl mx-auto px-6 mt-4">
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: '#fff5f5', border: '1px solid #fecaca' }}>
            <AlertCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* ── Resultado ────────────────────────────────────── */}
      {order && (
        <div className="max-w-2xl mx-auto px-6 mt-6 pb-12 space-y-4">

          {/* Order header */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Número de pedido</p>
                <p className="font-mono font-black text-lg" style={{ color: 'var(--text-primary)' }}>
                  #{order.id?.slice(-12).toUpperCase()}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {order.createdAt && new Date(order.createdAt).toLocaleDateString('es-PY', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span
                className="text-xs font-black px-3 py-1.5 rounded-xl"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}
              >
                {order.status}
              </span>
            </div>

            {/* Delivery info */}
            {order.address && (
              <div className="flex items-start gap-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <MapPin size={14} style={{ color: 'var(--accent)', marginTop: '2px' }} />
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {order.address.street}, {order.address.city}, {order.address.department}
                </p>
              </div>
            )}
          </div>

          {/* Progress steps */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
            <h3 className="font-black text-sm mb-6" style={{ color: 'var(--text-primary)' }}>Estado del pedido</h3>
            <div className="space-y-0">
              {STATUS_STEPS.map((step, idx) => {
                const done    = idx <= currentStep
                const current = idx === currentStep
                const Icon    = step.icon
                return (
                  <div key={step.key} className="flex gap-4">
                    {/* Icon + line */}
                    <div className="flex flex-col items-center">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                        style={{
                          background: done ? 'var(--accent)' : 'var(--bg-secondary)',
                          border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                          boxShadow: current ? '0 0 0 4px var(--accent-bg)' : 'none',
                        }}
                      >
                        <Icon size={16} style={{ color: done ? 'white' : 'var(--text-muted)' }} />
                      </div>
                      {idx < STATUS_STEPS.length - 1 && (
                        <div
                          className="w-0.5 flex-1 my-1 min-h-[24px]"
                          style={{ background: idx < currentStep ? 'var(--accent)' : 'var(--border)' }}
                        />
                      )}
                    </div>
                    {/* Text */}
                    <div className="pb-5">
                      <p className="text-sm font-black" style={{ color: done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                        {step.label}
                        {current && (
                          <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-lg"
                            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                            Actual
                          </span>
                        )}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Items */}
          {order.items?.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-4" style={{ color: 'var(--text-primary)' }}>Productos del pedido</h3>
              <div className="space-y-3">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                      style={{ background: 'var(--bg-secondary)' }}>
                      {item.product?.images?.[0]
                        ? <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        : <Package size={16} style={{ color: 'var(--text-muted)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.product?.name || 'Producto'}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Cant: {item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Help */}
          <div className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
            <Phone size={16} style={{ color: 'var(--accent)' }} />
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
              ¿Necesitás ayuda con tu pedido?{' '}
              <a href="https://wa.me/595984000001" target="_blank" rel="noopener noreferrer"
                className="font-black" style={{ color: 'var(--accent)' }}>
                Contactanos por WhatsApp →
              </a>
            </p>
          </div>

        </div>
      )}

      {/* ── Empty state ──────────────────────────────────── */}
      {!order && !error && !loading && (
        <div className="max-w-xl mx-auto px-6 py-12 text-center">
          <div className="text-5xl mb-3 opacity-30">🔍</div>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Ingresá tu número de pedido arriba para ver el estado
          </p>
        </div>
      )}

    </div>
  )
}
