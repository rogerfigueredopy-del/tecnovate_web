import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { ProductPageClient } from '@/components/ui/ProductPageClient'
import { ProductGallery }   from '@/components/ui/ProductGallery'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { formatPrice } from '@/lib/utils'
import { ChevronRight, Star, ShieldCheck, Truck, Package } from 'lucide-react'

async function getUsdRate(): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://tecnovate-new.vercel.app'}/api/exchange-rate`,
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    return data?.rate || 7900
  } catch { return 7900 }
}

function formatUsd(gs: any, rate: number): string {
  try {
    const n = Number(gs)
    if (!n || isNaN(n) || n <= 0) return ''
    return 'U$S ' + Math.round(n / rate).toLocaleString('en-US')
  } catch { return '' }
}

function safePrice(val: any): number {
  const n = Number(val)
  return isNaN(n) || n < 0 ? 0 : Math.round(n)
}

const GUARANTEES = [
  { icon: ShieldCheck, text: 'Garantía oficial' },
  { icon: Truck,       text: 'Envíos a todo Paraguay' },
  { icon: Package,     text: 'Producto original' },
]

export default async function ProductPage({ params }: { params: { slug: string } }) {
  let product: any = null
  let related: any[] = []

  try { product = await getProductBySlug(params.slug) } catch { notFound() }
  if (!product) notFound()

  try { related = await getRelatedProducts(product.categoryId, product.id, 6) } catch { related = [] }

  const usdRate  = await getUsdRate()
  const price    = safePrice(product.price)
  const oldPrice = product.oldPrice ? safePrice(product.oldPrice) : null
  const usdPrice = formatUsd(price, usdRate)
  const avgRating = product.reviews?.length
    ? (product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length).toFixed(1)
    : null

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-6 py-2.5 flex items-center gap-1.5 text-xs flex-wrap"
          style={{ color: 'var(--text-muted)' }}>
          <Link href="/" className="hover:underline" style={{ color: 'var(--accent)' }}>Inicio</Link>
          <ChevronRight size={12} />
          <Link href="/products" className="hover:underline" style={{ color: 'var(--accent)' }}>Productos</Link>
          <ChevronRight size={12} />
          <Link href={`/products?category=${product.category?.slug || ''}`}
            className="hover:underline" style={{ color: 'var(--accent)' }}>
            {product.category?.name || 'Productos'}
          </Link>
          <ChevronRight size={12} />
          <span className="truncate max-w-[200px]">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

          {/* Galería */}
          <div className="space-y-3">
            <ProductGallery images={product.images || []} name={product.name} />
          </div>

          {/* Info */}
          <div className="space-y-5">

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg"
                style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                {product.brand}
              </span>
              {product.sku && (
                <span className="text-xs px-2 py-1 rounded-lg"
                  style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                  SKU: {product.sku}
                </span>
              )}
            </div>

            <h1 className="text-2xl font-black leading-snug" style={{ color: 'var(--text-primary)' }}>
              {product.name}
            </h1>

            {avgRating && (
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={14}
                      fill={s <= Math.round(Number(avgRating)) ? 'var(--accent)' : 'none'}
                      style={{ color: 'var(--accent)' }} />
                  ))}
                </div>
                <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{avgRating}</span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  ({product.reviews.length} reseñas)
                </span>
              </div>
            )}

            {/* Precio */}
            <div className="py-4 px-5 rounded-2xl" style={{ background: 'white', border: '1.5px solid var(--border)' }}>
              {oldPrice && oldPrice > price && (
                <p className="text-sm line-through mb-0.5" style={{ color: 'var(--text-muted)' }}>
                  {formatPrice(oldPrice)}
                </p>
              )}
              <p className="text-3xl font-black" style={{ color: 'var(--accent)' }}>
                {formatPrice(price)}
              </p>
              {usdPrice && (
                <div className="mt-1">
                  <p className="text-base font-bold" style={{ color: 'var(--text-secondary)' }}>
                    {usdPrice}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    USD 1 = Gs. {usdRate.toLocaleString('es-PY')}
                  </p>
                </div>
              )}
              <p className="text-xs mt-2 font-semibold"
                style={{ color: (product.stock || 0) > 0 ? '#16a34a' : '#dc2626' }}>
                {(product.stock || 0) > 0
                  ? `✓ En stock — ${product.stock} disponibles`
                  : '✗ Sin stock momentáneamente'}
              </p>
            </div>

            <ProductPageClient product={{
              id: product.id, name: product.name, brand: product.brand,
              price, image: product.images?.[0] || '', slug: product.slug,
              stock: product.stock || 0,
            }} />

            <div className="grid grid-cols-2 gap-2">
              {GUARANTEES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                  <Icon size={14} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                </div>
              ))}
            </div>

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

        {/* Specs */}
        {product.specs && typeof product.specs === 'object' && Object.keys(product.specs).length > 0 && (
          <div className="bg-white rounded-2xl overflow-hidden mb-10" style={{ border: '1.5px solid var(--border)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent-bg)' }}>
              <h2 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Especificaciones técnicas</h2>
            </div>
            <div>
              {Object.entries(product.specs as Record<string, any>).map(([k, v], i) => (
                <div key={k} className="flex justify-between px-6 py-3 text-sm"
                  style={{ background: i % 2 === 0 ? 'white' : 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                  <span className="font-semibold" style={{ color: 'var(--text-muted)' }}>{k}</span>
                  <span className="font-bold text-right max-w-[60%]" style={{ color: 'var(--text-primary)' }}>
                    {String(v ?? '')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reseñas */}
        {product.reviews?.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
              <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
                Reseñas <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>
                  ({product.reviews.length})
                </span>
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((r: any) => (
                <div key={r.id} className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid var(--border)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-black text-white"
                      style={{ background: 'var(--accent)' }}>
                      {r.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>{r.user?.name}</p>
                      <div className="flex mt-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={12}
                            fill={s <= r.rating ? 'var(--accent)' : 'none'}
                            style={{ color: 'var(--accent)' }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {r.comment && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{r.comment}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Relacionados */}
        {related?.length > 0 && (
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
