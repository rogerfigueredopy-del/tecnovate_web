export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { AdminOrderStatus } from '@/components/admin/AdminOrderStatus'
import { MapPin, MessageCircle } from 'lucide-react'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  PENDING:    { bg: '#fffbeb', color: '#d97706', label: 'Pendiente' },
  PAID:       { bg: '#f0fdf4', color: '#16a34a', label: 'Pagado' },
  PROCESSING: { bg: 'var(--accent-bg)', color: 'var(--accent)', label: 'Procesando' },
  SHIPPED:    { bg: '#eff6ff', color: '#2563eb', label: 'Enviado' },
  DELIVERED:  { bg: '#f0fdf4', color: '#16a34a', label: 'Entregado' },
  CANCELLED:  { bg: '#fff5f5', color: '#dc2626', label: 'Cancelado' },
  REFUNDED:   { bg: '#f5f5f5', color: '#9ca3af', label: 'Reembolsado' },
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, images: true } } } },
      address: true,
    },
  })

  // Stats rápidas
  const pending   = orders.filter(o => o.status === 'PENDING').length
  const paid      = orders.filter(o => o.status === 'PAID').length
  const shipped   = orders.filter(o => o.status === 'SHIPPED').length
  const delivered = orders.filter(o => o.status === 'DELIVERED').length

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Pedidos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{orders.length} pedidos en total</p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-5">

        {/* ── Mini stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Pendientes',  value: pending,   bg: '#fffbeb', color: '#d97706' },
            { label: 'Pagados',     value: paid,      bg: '#f0fdf4', color: '#16a34a' },
            { label: 'Enviados',    value: shipped,   bg: '#eff6ff', color: '#2563eb' },
            { label: 'Entregados',  value: delivered, bg: 'var(--accent-bg)', color: 'var(--accent)' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3"
              style={{ border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-base"
                style={{ background: s.bg, color: s.color }}>
                {s.value}
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Tabla ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
                  {['Pedido', 'Cliente', 'Productos', 'Dirección', 'Total', 'Fecha', 'Estado', 'Cambiar'].map(h => (
                    <th key={h} className="text-left text-xs font-black px-5 py-3 uppercase tracking-wide whitespace-nowrap"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(order => {
                  const st = STATUS_STYLE[order.status] || STATUS_STYLE.PENDING
                  const waPhone = order.user.phone?.replace(/[^0-9]/g, '') || order.address?.phone?.replace(/[^0-9]/g, '')
                  return (
                    <tr key={order.id} className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: '1px solid var(--border)' }}>

                      {/* ID */}
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-black" style={{ color: 'var(--accent)' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                          {new Date(order.createdAt).toLocaleDateString('es-PY', { day: '2-digit', month: '2-digit' })}
                        </p>
                      </td>

                      {/* Cliente */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-bold truncate max-w-[130px]" style={{ color: 'var(--text-primary)' }}>
                          {order.user.name || '—'}
                        </p>
                        <p className="text-xs truncate max-w-[130px]" style={{ color: 'var(--text-muted)' }}>
                          {order.user.email}
                        </p>
                        {waPhone && (
                          <a
                            href={`https://wa.me/${waPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold mt-0.5"
                            style={{ color: '#16a34a' }}
                          >
                            <MessageCircle size={10} /> WA
                          </a>
                        )}
                      </td>

                      {/* Productos */}
                      <td className="px-5 py-4 max-w-[160px]">
                        <div className="flex items-center gap-2">
                          {order.items[0]?.product.images?.[0] && (
                            <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0"
                              style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                              <img src={order.items[0].product.images[0]} alt="" className="w-full h-full object-contain p-0.5" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="text-xs truncate" style={{ color: 'var(--text-primary)' }}>
                              {order.items[0]?.product.name || '—'}
                            </p>
                            {order.items.length > 1 && (
                              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                +{order.items.length - 1} más
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Dirección */}
                      <td className="px-5 py-4 max-w-[150px]">
                        {order.address ? (
                          <div className="flex items-start gap-1">
                            <MapPin size={11} className="mt-0.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {order.address.street}, {order.address.city}
                            </p>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--border)' }}>—</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>
                          {formatPrice(order.total)}
                        </p>
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(order.createdAt).toLocaleDateString('es-PY', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })}
                        </p>
                      </td>

                      {/* Badge estado */}
                      <td className="px-5 py-4">
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>

                      {/* Cambiar estado */}
                      <td className="px-5 py-4">
                        <AdminOrderStatus orderId={order.id} currentStatus={order.status} />
                      </td>

                    </tr>
                  )
                })}
              </tbody>
            </table>

            {orders.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>No hay pedidos todavía.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
