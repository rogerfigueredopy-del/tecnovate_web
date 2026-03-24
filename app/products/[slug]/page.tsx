import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { ProductPageClient } from '@/components/ui/ProductPageClient'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Star, Package, ShieldCheck, Truck, RotateCcw } from 'lucide-react'

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug)
  if (!product) notFound()

  const related = await getRelatedProducts(product.categoryId, product.id)

  const avgRating = product.reviews.length
    ? (product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null

  const GUARANTEES = [
    { icon: ShieldCheck, text: 'Garantía oficial de fábrica' },
    { icon: Truck,       text: 'Envío express Ciudad del Este' },
    { icon: RotateCcw,   text: '30 días de devolución' },
    { icon: Package,     text: 'Producto 100% original' },
  ]

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Breadcrumb ─────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--accent)' }}>Inicio</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:underline" style={{ color: 'var(--accent)' }}>Productos</Link>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.category.slug}`} className="hover:underline" style={{ color: 'var(--accent)' }}>
            {product.category.name}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* ── Galería de imágenes ────────────────────────── */}
          <div className="space-y-3">
            {/* Main image */}
            <div
              className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-white"
              style={{ aspectRatio: '1', border: '1.5px solid var(--border)', padding: '32px' }}
            >
              {discount && (
                <span
                  className="absolute top-4 left-4 text-white text-xs font-black px-3 py-1 rounded-xl z-10"
                  style={{ background: '#dc2626' }}
                >
                  -{discount}%
                </span>
              )}
              {product.images[0] ? (
                <Image
                  src={product.images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-8"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  unoptimized
                />
              ) : (
                <div className="text-8xl opacity-20">📦</div>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className="w-16 h-16 shrink-0 rounded-xl overflow-hidden flex items-center justify-center bg-white"
                    style={{ border: i === 0 ? '2px solid var(--accent)' : '1.5px solid var(--border)', padding: '4px' }}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Info del producto ──────────────────────────── */}
          <div className="space-y-5">

            {/* Brand + category */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
              >
                {product.brand}
              </span>
              <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                {product.category.name}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>

            {/* Rating */}
            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star
                      key={s}
                      size={14}
                      fill={s <= Math.round(Number(avgRating)) ? 'var(--accent)' : 'none'}
                      style={{ color: 'var(--accent)' }}
                    />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{avgRating}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({product.reviews.length} reseñas)</span>
              </div>
            )}

            {/* Price */}
            <div className="py-4 px-5 rounded-2xl" style={{ background: 'white', border: '1.5px solid var(--border)' }}>
              {product.oldPrice && product.oldPrice > product.price && (
                <p className="text-sm line-through mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatPrice(product.oldPrice)}
                </p>
              )}
              <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                {formatPrice(product.price)}
              </p>
              {discount && (
                <p className="text-xs font-black mt-1" style={{ color: '#16a34a' }}>
                  ✓ Ahorrás {formatPrice(product.oldPrice! - product.price)}
                </p>
              )}
              <p className="text-xs mt-2 font-semibold" style={{ color: product.stock > 0 ? '#16a34a' : '#dc2626' }}>
                {product.stock > 0
                  ? `✓ En stock — ${product.stock} disponibles`
                  : '✗ Sin stock momentáneamente'
                }
              </p>
            </div>

            {/* Add to cart component */}
            <ProductPageClient product={{
              id: product.id,
              name: product.name,
              brand: product.brand,
              price: product.price,
              image: product.images[0],
              slug: product.slug,
              stock: product.stock,
            }} />

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2">
              {GUARANTEES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                  <Icon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div className="pt-2">
                <h3 className="font-black text-sm mb-2" style={{ color: 'var(--text-primary)' }}>Descripción</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Especificaciones ──────────────────────────────── */}
        {product.specs && Object.keys(product.specs as any).length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden mb-10" style={{ border: '1.5px solid var(--border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
              <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Especificaciones técnicas</h2>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {Object.entries(product.specs as Record<string, string>).map(([k, v], i) => (
                <div
                  key={k}
                  className="flex justify-between px-6 py-3 text-sm"
                  style={{ background: i % 2 === 0 ? 'white' : 'var(--bg-secondary)' }}
                >
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="font-bold text-right max-w-[60%]" style={{ color: 'var(--text-primary)' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Reseñas ───────────────────────────────────────── */}
        {product.reviews.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                Reseñas de clientes
                <span className="ml-2 text-sm font-bold" style={{ color: 'var(--accent)' }}>({product.reviews.length})</span>
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map(r => (
                <div key={r.id} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                      style={{ background: 'var(--accent)' }}
                    >
                      {r.user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{r.user.name}</p>
                      <div className="flex mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12} fill={s <= r.rating ? 'var(--accent)' : 'none'} style={{ color: 'var(--accent)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comment && <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Productos relacionados ────────────────────────── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>Productos relacionados</h2>
            </div>
            <ProductGrid products={related} />
          </div>
        )}
      </div>
    </div>
  )
}
