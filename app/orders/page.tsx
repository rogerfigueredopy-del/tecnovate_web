'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatPrice } from '@/lib/utils'
import {
  Package, ChevronDown, ChevronUp, MapPin,
  CreditCard, Truck, CheckCircle, Clock, XCircle, ArrowRight
} from 'lucide-react'

// ── Tipos ─────────────────────────────────────────────────────────
interface OrderItem {
  product: { name: string; images: string[]; brand: string; slug: string }
  quantity: number
  price: number
}
interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  paymentMethod: string | null
  items: OrderItem[]
  address: { street: string; city: string; department: string } | null
}

// ── Config de estados ─────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; icon: React.ElementType }> = {
  PENDING:    { label: 'Pendiente',   bg: '#fffbeb', color: '#d97706',         icon: Clock },
  PAID:       { label: 'Pagado',      bg: '#f0fdf4', color: '#16a34a',         icon: CheckCircle },
  PROCESSING: { label: 'Procesando',  bg: 'var(--accent-bg)', color: 'var(--accent)', icon: Package },
  SHIPPED:    { label: 'Enviado',     bg: '#eff6ff', color: '#2563eb',         icon: Truck },
  DELIVERED:  { label: 'Entregado',   bg: '#f0fdf4', color: '#16a34a',         icon: CheckCircle },
  CANCELLED:  { label: 'Cancelado',   bg: '#fff5f5', color: '#dc2626',         icon: XCircle },
  REFUNDED:   { label: 'Reembolsado', bg: '#f5f5f5', color: '#9ca3af',         icon: XCircle },
}

const PROGRESS_STEPS = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
const STEP_LABELS    = ['Recibido', 'Pagado', 'Preparando', 'Enviado', 'Entregado']

// ── Componente barra de progreso ──────────────────────────────────
function OrderProgress({ status }: { status: string }) {
  if (status === 'CANCELLED' || status === 'REFUNDED') return null
  const currentIdx = PROGRESS_STEPS.indexOf(status)

  return (
    <div className="pt-4" style={{ borderTop: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between relative">
        {/* Línea de fondo */}
        <div className="absolute top-3 left-0 right-0 h-0.5" style={{ background: 'var(--border)' }} />
        {/* Línea de progreso */}
        <div
          className="absolute top-3 left-0 h-0.5 transition-all duration-500"
          style={{
            background: 'var(--accent)',
            width: currentIdx >= 0 ? `${(currentIdx / (PROGRESS_STEPS.length - 1)) * 100}%` : '0%',
          }}
        />
        {PROGRESS_STEPS.map((step, i) => {
          const done = i <= currentIdx
          return (
            <div key={step} className="flex flex-col items-center gap-1.5 relative z-10">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
                style={{
                  background: done ? 'var(--accent)' : 'white',
                  border: `2px solid ${done ? 'var(--accent)' : 'var(--border)'}`,
                }}
              >
                {done && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span
                className="text-xs font-bold whitespace-nowrap"
                style={{ color: done ? 'var(--accent)' : 'var(--text-muted)', fontSize: '10px' }}
              >
                {STEP_LABELS[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────
export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders]     = useState<Order[]>([])
  const [loading, setLoading]   = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/orders')
  }, [status, router])

  useEffect(() => {
    if (!session) return
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [session])

  // ── Loading ───────────────────────────────────────────────────
  if (status === 'loading' || loading) {
    return (
      <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <div className="max-w-3xl mx-auto px-6 pt-16 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-2xl p-5 animate-pulse" style={{ border: '1px solid var(--border)' }}>
              <div className="flex justify-between">
                <div className="space-y-2">
                  <div className="h-3 w-24 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-5 w-32 rounded" style={{ background: 'var(--border)' }} />
                  <div className="h-3 w-28 rounded" style={{ background: 'var(--border)' }} />
                </div>
                <div className="h-7 w-20 rounded-xl" style={{ background: 'var(--border)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Sin pedidos ───────────────────────────────────────────────
  if (!orders.length) {
    return (
      <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <div className="max-w-md mx-auto px-6 py-24 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--accent-bg)' }}
          >
            <Package size={40} style={{ color: 'var(--accent-light)' }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Sin pedidos todavía
          </h2>
          <p className="text-sm mb-7" style={{ color: 'var(--text-muted)' }}>
            Cuando hagas tu primera compra aparecerá acá con toda la información.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
          >
            <Package size={16} />
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  // ── Lista de pedidos ──────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-3xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Mis Pedidos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {orders.length} pedido{orders.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          <Link href="/track"
            className="flex items-center gap-2 text-xs font-black px-4 py-2 rounded-xl transition-all hover:scale-105"
            style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}>
            🔍 Rastrear pedido
          </Link>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-4">
        {orders.map(order => {
          const sc        = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING
          const StatusIcon = sc.icon
          const isOpen    = expanded === order.id

          return (
            <div
              key={order.id}
              className="bg-white rounded-2xl overflow-hidden transition-all"
              style={{ border: `1.5px solid ${isOpen ? 'var(--accent)' : 'var(--border)'}` }}
            >
              {/* ── Card header (clickeable) ─────────────────── */}
              <button
                onClick={() => setExpanded(isOpen ? null : order.id)}
                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  {/* Ícono de estado */}
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: sc.bg }}
                  >
                    <StatusIcon size={20} style={{ color: sc.color }} />
                  </div>

                  <div>
                    <p className="font-mono text-xs font-black mb-0.5" style={{ color: 'var(--text-muted)' }}>
                      #{order.id.slice(-10).toUpperCase()}
                    </p>
                    <p className="font-black text-base" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(order.total)}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {new Date(order.createdAt).toLocaleDateString('es-PY', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className="text-xs font-black px-3 py-1.5 rounded-xl"
                    style={{ background: sc.bg, color: sc.color }}
                  >
                    {sc.label}
                  </span>
                  {isOpen
                    ? <ChevronUp size={16} style={{ color: 'var(--text-muted)' }} />
                    : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
                  }
                </div>
              </button>

              {/* ── Detalle expandido ────────────────────────── */}
              {isOpen && (
                <div className="px-5 pb-5 space-y-5" style={{ borderTop: '1px solid var(--border)' }}>

                  {/* Progreso */}
                  <div className="pt-4">
                    <OrderProgress status={order.status} />
                  </div>

                  {/* Productos */}
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest mb-3"
                      style={{ color: 'var(--text-muted)' }}>
                      Productos
                    </p>
                    <div className="space-y-2.5">
                      {order.items.map((item, i) => (
                        <Link
                          key={i}
                          href={`/products/${item.product.slug}`}
                          className="flex items-center gap-3 p-3 rounded-xl transition-colors hover:bg-gray-50"
                          style={{ border: '1px solid var(--border)' }}
                        >
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                            style={{ background: 'var(--bg-secondary)' }}
                          >
                            {item.product.images?.[0]
                              ? <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                              : <span className="text-xl">📦</span>
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>
                              {item.product.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {item.product.brand} · ×{item.quantity}
                            </p>
                          </div>
                          <p className="text-sm font-black shrink-0" style={{ color: 'var(--accent)' }}>
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Info entrega + pago */}
                  <div className="grid grid-cols-2 gap-4">
                    {order.address && (
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <MapPin size={12} style={{ color: 'var(--accent)' }} />
                          <p className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>ENTREGA</p>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {order.address.street}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {order.address.city}, {order.address.department}
                        </p>
                      </div>
                    )}
                    {order.paymentMethod && (
                      <div className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                        <div className="flex items-center gap-1.5 mb-1">
                          <CreditCard size={12} style={{ color: 'var(--accent)' }} />
                          <p className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>PAGO</p>
                        </div>
                        <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {order.paymentMethod === 'bancard'  ? '💳 Bancard'
                           : order.paymentMethod === 'paypal' ? '🌐 PayPal'
                           : order.paymentMethod === 'cash'   ? '💵 Efectivo'
                           : order.paymentMethod === 'transfer' ? '📱 Tigo Money'
                           : order.paymentMethod}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Total + acciones */}
                  <div
                    className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Total del pedido</p>
                      <p className="text-xl font-black" style={{ color: 'var(--accent)' }}>
                        {formatPrice(order.total)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/track?id=${order.id}`}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
                        style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-light)' }}
                      >
                        Rastrear
                        <ArrowRight size={12} />
                      </Link>
                      <a
                        href={`https://wa.me/595984000001?text=Consulta sobre pedido %23${order.id.slice(-8).toUpperCase()}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all hover:scale-105"
                        style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}
                      >
                        Consultar WS
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
