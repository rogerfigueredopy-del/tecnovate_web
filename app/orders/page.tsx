'use client'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { Package, ChevronDown, ChevronUp } from 'lucide-react'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', PROCESSING: 'Procesando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  PAID: 'text-green-400 bg-green-400/10 border-green-400/20',
  PROCESSING: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  SHIPPED: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  DELIVERED: 'text-green-500 bg-green-500/10 border-green-500/20',
  CANCELLED: 'text-red-400 bg-red-400/10 border-red-400/20',
}

interface OrderItem {
  product: { name: string; images: string[]; brand: string }
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
  address: { street: string; city: string } | null
}

export default function OrdersPage() {
  const { data: session } = useSession()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!session) return
    fetch('/api/orders')
      .then(r => r.json())
      .then(d => setOrders(d.orders || []))
      .finally(() => setLoading(false))
  }, [session])

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 mb-4">Iniciá sesión para ver tus pedidos.</p>
        <Link href="/login" className="text-cyan-400 hover:underline">Iniciar sesión →</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-gray-500">
        Cargando pedidos...
      </div>
    )
  }

  if (!orders.length) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-gray-700 mb-4" />
        <h2 className="text-xl font-bold mb-2">Sin pedidos todavía</h2>
        <p className="text-gray-500 mb-6">Cuando hagas tu primera compra, aparecerá acá.</p>
        <Link href="/products" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-2xl font-black mb-8">Mis Pedidos</h1>

      <div className="space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
            {/* Header */}
            <button
              onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div>
                  <p className="font-mono text-xs text-gray-500 mb-0.5">
                    #{order.id.slice(-8).toUpperCase()}
                  </p>
                  <p className="font-bold text-base">{formatPrice(order.total)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString('es-PY', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${STATUS_COLORS[order.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                  {STATUS_LABELS[order.status] || order.status}
                </span>
                {expanded === order.id
                  ? <ChevronUp size={16} className="text-gray-500" />
                  : <ChevronDown size={16} className="text-gray-500" />
                }
              </div>
            </button>

            {/* Expanded detail */}
            {expanded === order.id && (
              <div className="border-t border-gray-800 p-5 space-y-4">
                {/* Items */}
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Productos</p>
                  <div className="space-y-2.5">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                          {item.product.images?.[0]
                            ? <img src={item.product.images[0]} alt="" className="w-full h-full object-contain p-1" />
                            : <span className="text-xl">📦</span>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.product.name}</p>
                          <p className="text-xs text-gray-500">{item.product.brand} · ×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold text-green-400 shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery + payment info */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-800">
                  {order.address && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Entrega</p>
                      <p className="text-sm text-gray-300">{order.address.street}</p>
                      <p className="text-sm text-gray-400">{order.address.city}</p>
                    </div>
                  )}
                  {order.paymentMethod && (
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Método de pago</p>
                      <p className="text-sm text-gray-300 capitalize">
                        {order.paymentMethod === 'bancard' ? '💳 Bancard'
                          : order.paymentMethod === 'paypal' ? '🌐 PayPal'
                          : order.paymentMethod === 'cash' ? '💵 Efectivo'
                          : order.paymentMethod}
                      </p>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                {order.status !== 'CANCELLED' && (
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex justify-between mb-2">
                      {['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].map((s, i) => {
                        const steps = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED']
                        const currentIdx = steps.indexOf(order.status)
                        const done = i <= currentIdx
                        return (
                          <div key={s} className="flex flex-col items-center gap-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${done ? 'bg-cyan-400' : 'bg-gray-700'}`} />
                            <span className={`text-xs ${done ? 'text-cyan-400' : 'text-gray-600'}`}>
                              {STATUS_LABELS[s]}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="relative h-1 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="absolute left-0 top-0 h-full bg-cyan-400 rounded-full transition-all duration-500"
                        style={{
                          width: `${(['PENDING','PAID','PROCESSING','SHIPPED','DELIVERED'].indexOf(order.status) / 4) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
