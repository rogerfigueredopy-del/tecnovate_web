export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const [totalOrders, totalUsers, totalProducts, recentOrders, revenue] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'] } },
      _sum: { total: true },
    }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, status: 'ACTIVE' },
      take: 5,
      orderBy: { stock: 'asc' },
    }),
  ])

  return { totalOrders, totalUsers, totalProducts, recentOrders, revenue: revenue._sum.total || 0 }
}

const statusColor: Record<string, string> = {
  PENDING: 'text-amber-400 bg-amber-400/10',
  PAID: 'text-green-400 bg-green-400/10',
  PROCESSING: 'text-cyan-400 bg-cyan-400/10',
  SHIPPED: 'text-blue-400 bg-blue-400/10',
  DELIVERED: 'text-green-500 bg-green-500/10',
  CANCELLED: 'text-red-400 bg-red-400/10',
}

const statusLabel: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', PROCESSING: 'Procesando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregado', CANCELLED: 'Cancelado',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <Link href="/admin/products/new" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors">
          + Nuevo Producto
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Ventas totales', value: formatPrice(stats.revenue), color: 'text-green-400', icon: '💰', sub: 'Pedidos pagados' },
          { label: 'Pedidos', value: stats.totalOrders.toString(), color: 'text-cyan-400', icon: '📦', sub: 'Total registrados' },
          { label: 'Usuarios', value: stats.totalUsers.toString(), color: 'text-purple-400', icon: '👥', sub: 'Cuentas activas' },
          { label: 'Productos', value: stats.totalProducts.toString(), color: 'text-amber-400', icon: '🏷️', sub: 'Publicados' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-xs text-gray-600">{s.sub}</span>
            </div>
            <div className={`text-2xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="font-bold">Últimos Pedidos</h2>
          <Link href="/admin/orders" className="text-sm text-cyan-400 hover:text-cyan-300">Ver todos →</Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No hay pedidos todavía</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">ID</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Cliente</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Productos</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Total</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Estado</th>
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map(order => (
                  <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                    <td className="px-5 py-3.5 text-cyan-400 font-mono text-xs">#{order.id.slice(-6).toUpperCase()}</td>
                    <td className="px-5 py-3.5">
                      <div className="text-sm font-medium">{order.user.name || 'Sin nombre'}</div>
                      <div className="text-xs text-gray-500">{order.user.email}</div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-400">
                      {order.items[0]?.product.name || '-'}
                      {order.items.length > 1 && <span className="text-gray-600"> +{order.items.length - 1}</span>}
                    </td>
                    <td className="px-5 py-3.5 text-green-400 font-bold text-sm">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-lg ${statusColor[order.status] || 'text-gray-400 bg-gray-400/10'}`}>
                        {statusLabel[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('es-PY')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
