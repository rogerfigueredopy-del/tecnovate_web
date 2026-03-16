import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import { AdminProductActions } from '@/components/admin/AdminProductActions'

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: { not: 'ARCHIVED' } },
    include: { category: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Productos</h1>
          <p className="text-sm text-gray-500 mt-1">{products.length} productos en total</p>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          + Nuevo Producto
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3 w-12"></th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Producto</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Categoría</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Precio</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Stock</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Estado</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">PC Builder</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
                      {p.images[0] ? (
                        <Image src={p.images[0]} alt="" width={40} height={40} className="object-contain" />
                      ) : (
                        <span className="text-xl">📦</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-semibold text-sm truncate max-w-[200px]">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.brand} {p.sku && `· ${p.sku}`}</div>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-400">{p.category.name}</td>
                  <td className="px-5 py-3">
                    <div className="text-sm font-semibold text-green-400">{formatPrice(p.price)}</div>
                    {p.oldPrice && <div className="text-xs text-gray-500 line-through">{formatPrice(p.oldPrice)}</div>}
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-amber-400' : 'text-gray-300'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      p.status === 'ACTIVE' ? 'bg-green-500/15 text-green-400' :
                      p.status === 'DRAFT' ? 'bg-gray-500/15 text-gray-400' :
                      'bg-red-500/15 text-red-400'
                    }`}>
                      {p.status === 'ACTIVE' ? 'Activo' : p.status === 'DRAFT' ? 'Borrador' : 'Sin stock'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-xs text-cyan-400">
                    {p.pcBuilderSlot || <span className="text-gray-600">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <AdminProductActions productId={p.id} productName={p.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <div className="text-4xl mb-3">📦</div>
              <p>No hay productos todavía.</p>
              <Link href="/admin/products/new" className="text-cyan-400 text-sm hover:underline mt-2 inline-block">
                Agregar el primer producto →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
