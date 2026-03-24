export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import { AdminProductActions } from '@/components/admin/AdminProductActions'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  ACTIVE:       { bg: '#f0fdf4', color: '#16a34a', label: 'Activo' },
  DRAFT:        { bg: 'var(--bg-secondary)', color: 'var(--text-muted)', label: 'Borrador' },
  OUT_OF_STOCK: { bg: '#fff5f5', color: '#dc2626', label: 'Sin stock' },
  ARCHIVED:     { bg: '#f5f5f5', color: '#9ca3af', label: 'Archivado' },
}

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: 'ARCHIVED' } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const total   = products.length
  const active  = products.filter(p => p.status === 'ACTIVE').length
  const lowStock = products.filter(p => p.stock <= 5 && p.stock > 0).length
  const noStock  = products.filter(p => p.stock === 0).length

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Productos</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{total} productos en total</p>
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

      <div className="p-8 space-y-5">

        {/* ── Mini stats ───────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total',       value: total,     color: 'var(--accent)',  bg: 'var(--accent-bg)' },
            { label: 'Activos',     value: active,    color: '#16a34a',        bg: '#f0fdf4' },
            { label: 'Stock bajo',  value: lowStock,  color: '#d97706',        bg: '#fffbeb' },
            { label: 'Sin stock',   value: noStock,   color: '#dc2626',        bg: '#fff5f5' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 flex items-center gap-3" style={{ border: '1px solid var(--border)' }}>
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
                  {['Producto', 'Categoría', 'Precio', 'Stock', 'Estado', 'PC Builder', 'Acciones'].map(h => (
                    <th key={h} className="text-left text-xs font-black px-5 py-3 uppercase tracking-wide"
                      style={{ color: 'var(--text-muted)' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const st = STATUS_STYLE[p.status] || STATUS_STYLE.DRAFT
                  return (
                    <tr key={p.id} className="transition-colors hover:bg-gray-50"
                      style={{ borderBottom: '1px solid var(--border)' }}>

                      {/* Producto */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                            {p.images[0]
                              ? <img src={p.images[0]} alt="" className="w-full h-full object-contain p-1" />
                              : <span className="text-xl">📦</span>
                            }
                          </div>
                          <div>
                            <p className="font-black text-sm truncate max-w-[180px]" style={{ color: 'var(--text-primary)' }}>
                              {p.name}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                              {p.brand}{p.sku ? ` · ${p.sku}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                          {p.category.name}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>{formatPrice(p.price)}</p>
                        {p.oldPrice && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(p.oldPrice)}</p>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-black"
                          style={{ color: p.stock === 0 ? '#dc2626' : p.stock <= 5 ? '#d97706' : 'var(--text-primary)' }}>
                          {p.stock}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-black px-2.5 py-1 rounded-xl"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>

                      {/* PC Builder */}
                      <td className="px-5 py-3.5">
                        {p.pcBuilderSlot
                          ? <span className="text-xs font-black px-2 py-1 rounded-lg"
                              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                              {p.pcBuilderSlot}
                            </span>
                          : <span style={{ color: 'var(--border)' }}>—</span>
                        }
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-3.5">
                        <AdminProductActions productId={p.id} productName={p.name} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {products.length === 0 && (
              <div className="text-center py-20">
                <div className="text-5xl mb-3">📦</div>
                <p className="font-semibold" style={{ color: 'var(--text-muted)' }}>No hay productos todavía.</p>
                <Link href="/admin/products/new" className="text-sm font-black mt-2 inline-block" style={{ color: 'var(--accent)' }}>
                  Agregar el primer producto →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
