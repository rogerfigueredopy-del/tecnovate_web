import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { ProductPageClient } from '@/components/ui/ProductPageClient'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { formatPrice } from '@/lib/utils'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.categoryId, product.id)

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex items-center justify-center">
            {product.images[0] ? (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={600}
                height={600}
                className="object-contain p-8"
                priority
              />
            ) : (
              <span className="text-8xl">📦</span>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.slice(1, 5).map((img, i) => (
                <div key={i} className="aspect-square bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  <Image src={img} alt="" width={150} height={150} className="w-full h-full object-contain p-2" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest mb-2">
            {product.category.name} · {product.brand}
          </p>
          <h1 className="text-3xl font-black text-white leading-tight mb-4">{product.name}</h1>

          {avgRating && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400 text-sm">
                {'★'.repeat(Math.round(parseFloat(avgRating)))}
                {'☆'.repeat(5 - Math.round(parseFloat(avgRating)))}
              </div>
              <span className="text-sm text-gray-400">{avgRating} ({product.reviews.length} reseñas)</span>
            </div>
          )}

          <div className="mb-6">
            {product.oldPrice && (
              <p className="text-gray-500 line-through text-lg">{formatPrice(product.oldPrice)}</p>
            )}
            <div className="flex items-end gap-3">
              <p className="text-4xl font-black text-green-400">{formatPrice(product.price)}</p>
              {product.oldPrice && (
                <span className="bg-red-500 text-white text-sm font-bold px-2 py-1 rounded-lg mb-1">
                  -{Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {product.stock > 0
                ? <span className="text-green-400">✓ En stock ({product.stock} disponibles)</span>
                : <span className="text-red-400">✗ Sin stock</span>
              }
            </p>
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs as any).length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold mb-3 text-gray-400">Especificaciones</h3>
              <div className="space-y-1.5">
                {Object.entries(product.specs as Record<string, string>).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-gray-500">{k}</span>
                    <span className="text-gray-200 font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add to cart — client component */}
          <ProductPageClient product={{
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0],
            slug: product.slug,
            stock: product.stock,
          }} />

          {/* Description */}
          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold mb-2 text-sm text-gray-400">Descripción</h3>
              <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews.length > 0 && (
        <div className="mb-14">
          <h2 className="text-xl font-bold mb-4">Reseñas de clientes</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map(r => (
              <div key={r.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center text-sm font-bold">
                    {r.user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{r.user.name}</p>
                    <div className="text-amber-400 text-xs">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-400">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Productos relacionados</h2>
          <ProductGrid products={related} />
        </div>
      )}
    </div>
  )
}
