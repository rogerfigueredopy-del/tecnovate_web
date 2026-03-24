export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import Link from 'next/link'

async function getStats() {
  const [totalOrders, totalUsers, totalProducts, recentOrders, revenue, lowStock] = await Promise.all([
    prisma.order.count(),
    prisma.user.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.order.findMany({
      take: 8,
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
      select: { id: true, name: true, stock: true, images: true },
    }),
  ])
  return { totalOrders, totalUsers, totalProducts, recentOrders, revenue: revenue._sum.total || 0, lowStock }
}

const STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: '#fffbeb', color: '#d97706' },
  PAID:       { bg: '#f0fdf4', color: '#16a34a' },
  PROCESSING: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  SHIPPED:    { bg: '#eff6ff', color: '#2563eb' },
  DELIVERED:  { bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED:  { bg: '#fff5f5', color: '#dc2626' },
  REFUNDED:   { bg: '#f5f5f5', color: '#6b7280' },
}
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente', PAID: 'Pagado', PROCESSING: 'Procesando',
  SHIPPED: 'Enviado',   DELIVERED: 'Entregado', CANCELLED: 'Cancelado', REFUNDED: 'Reembolsado',
}

export default async function AdminDashboard() {
  const stats = await getStats()

  const CARDS = [
    { label: 'Ventas totales',  value: formatPrice(stats.revenue),            icon: '💰', sub: 'Pedidos pagados',   accent: '#16a34a' },
    { label: 'Pedidos',         value: stats.totalOrders.toString(),           icon: '📦', sub: 'Total registrados', accent: 'var(--accent)' },
    { label: 'Usuarios',        value: stats.totalUsers.toString(),            icon: '👥', sub: 'Cuentas activas',   accent: '#7b2d9e' },
    { label: 'Productos',       value: stats.totalProducts.toString(),         icon: '🏷️', sub: 'Publicados',        accent: '#d97706' },
  ]

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {new Date().toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.3)' }}
          >
            + Nuevo Producto
          </Link>
        </div>
      </div>

      <div className="p-8 space-y-6">

        {/* ── Stat cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CARDS.map(c => (
            <div key={c.label} className="bg-white rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{c.icon}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-lg"
                  style={{ background: `${c.accent}15`, color: c.accent }}>
                  {c.sub}
                </span>
              </div>
              <p className="text-2xl font-black" style={{ color: c.accent }}>{c.value}</p>
              <p className="text-xs mt-1 font-semibold" style={{ color: 'var(--text-muted)' }}>{c.label}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ── Últimos pedidos ────────────────────────────── */}
          <div className="lg:col-span-2 bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Últimos Pedidos</h2>
              <Link href="/admin/orders" className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                Ver todos →
              </Link>
            </div>

            {stats.recentOrders.length === 0 ? (
              <div className="py-16 text-center">
                <div className="text-4xl mb-3">📦</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hay pedidos todavía.</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {stats.recentOrders.map(order => {
                  const sc = STATUS_COLOR[order.status] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)' }
                  return (
                    <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50 transition-colors">
                      <div>
                        <p className="font-mono text-xs font-black" style={{ color: 'var(--text-muted)' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-sm font-semibold truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
                          {order.user.name || order.user.email}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {order.items[0]?.product.name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}
                        </p>
                      </div>
                      <span className="text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap"
                        style={{ background: sc.bg, color: sc.color }}>
                        {STATUS_LABEL[order.status] || order.status}
                      </span>
                      <p className="text-sm font-black whitespace-nowrap" style={{ color: 'var(--accent)' }}>
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Stock bajo ─────────────────────────────────── */}
          <div className="bg-white rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
              <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>⚠️ Stock bajo</h2>
              <Link href="/admin/products" className="text-xs font-black" style={{ color: 'var(--accent)' }}>
                Ver todos →
              </Link>
            </div>
            {stats.lowStock.length === 0 ? (
              <div className="py-12 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Todo en orden</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {stats.lowStock.map(p => (
                  <div key={p.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--bg-secondary)' }}>
                      {p.images[0]
                        ? <img src={p.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        : <span className="text-lg">📦</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                    </div>
                    <span
                      className="text-xs font-black px-2 py-0.5 rounded-lg"
                      style={{
                        background: p.stock === 0 ? '#fff5f5' : '#fffbeb',
                        color: p.stock === 0 ? '#dc2626' : '#d97706',
                      }}
                    >
                      {p.stock === 0 ? 'Sin stock' : `${p.stock} uds`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* ── Accesos rápidos ──────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/admin/products/new', icon: '➕', label: 'Nuevo producto',   desc: 'Cargar a la tienda' },
            { href: '/admin/orders',       icon: '📋', label: 'Ver pedidos',       desc: 'Gestionar estados' },
            { href: '/admin/users',        icon: '👥', label: 'Usuarios',          desc: 'Ver clientes' },
            { href: '/admin/settings',     icon: '⚙️', label: 'Configuración',    desc: 'Bancard, PayPal...' },
          ].map(a => (
            <Link
              key={a.href}
              href={a.href}
              className="bg-white rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-md"
              style={{ border: '1px solid var(--border)' }}
            >
              <div className="text-2xl mb-2">{a.icon}</div>
              <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{a.label}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{a.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}
