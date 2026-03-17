export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { AdminOrderStatus } from '@/components/admin/AdminOrderStatus'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', PROCESSING: 'Procesando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-400/10', PAID: 'text-green-400 bg-green-400/10',
  PROCESSING: 'text-cyan-400 bg-cyan-400/10', SHIPPED: 'text-blue-400 bg-blue-400/10',
  DELIVERED: 'text-green-500 bg-green-500/10', CANCELLED: 'text-red-400 bg-red-400/10',
  REFUNDED: 'text-gray-400 bg-gray-400/10',
}

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: { select: { name: true } } } },
      address: true,
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Pedidos</h1>
          <p className="text-sm text-gray-500 mt-1">{orders.length} pedidos en total</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">ID</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Cliente</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Productos</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Dirección</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Total</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Estado</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Fecha</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-cyan-400">
                    #{order.id.slice(-8).toUpperCase()}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="text-sm font-medium">{order.user.name || '—'}</div>
                    <div className="text-xs text-gray-500">{order.user.email}</div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400 max-w-[160px]">
                    <div className="truncate">{order.items[0]?.product.name || '—'}</div>
                    {order.items.length > 1 && <div className="text-xs text-gray-600">+{order.items.length - 1} más</div>}
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500 max-w-[140px]">
                    {order.address
                      ? `${order.address.street}, ${order.address.city}`
                      : '—'
                    }
                  </td>
                  <td className="px-5 py-3.5 text-green-400 font-bold text-sm">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${STATUS_COLORS[order.status] || ''}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('es-PY')}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminOrderStatus orderId={order.id} currentStatus={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {orders.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">📦</div>
              <p>No hay pedidos todavía.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
