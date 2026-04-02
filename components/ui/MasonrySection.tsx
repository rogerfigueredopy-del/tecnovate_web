'use client'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

// Tarjeta grande (ocupa 2 columnas o 2 filas)
function BigCard({ product }: { product: any }) {
  const addItem = useCartStore(s => s.addItem)
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addItem({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images?.[0] || '', slug: product.slug })
    toast.success('¡Agregado!')
  }
  return (
    <Link href={`/products/${product.slug}`}
      className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-xl h-full"
      style={{ border: '1px solid var(--border)' }}>
      <div className="relative flex items-center justify-center flex-1 bg-white" style={{ minHeight: '220px', padding: '16px' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain" style={{ maxHeight: '200px' }} />
          : <div className="text-6xl opacity-20">📦</div>}
        {product.oldPrice && (
          <span className="absolute top-3 left-3 text-white text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: '#dc2626' }}>
            -{Math.round((1 - product.price / product.oldPrice) * 100)}%
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-xs font-black uppercase mb-1" style={{ color: 'var(--accent)', fontSize: '10px' }}>{product.brand}</p>
        <p className="text-sm font-semibold line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
        {product.oldPrice && <p className="text-xs line-through mb-0.5" style={{ color: 'var(--text-muted)' }}>{formatPrice(product.oldPrice)}</p>}
        <div className="flex items-center justify-between">
          <p className="text-base font-black" style={{ color: 'var(--accent)' }}>{formatPrice(product.price)}</p>
          <button onClick={handleAdd}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-all hover:scale-110"
            style={{ background: 'var(--accent)' }}>
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>
    </Link>
  )
}

// Tarjeta pequeña (normal)
function SmallCard({ product }: { product: any }) {
  const addItem = useCartStore(s => s.addItem)
  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    addItem({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images?.[0] || '', slug: product.slug })
    toast.success('¡Agregado!')
  }
  return (
    <Link href={`/products/${product.slug}`}
      className="bg-white rounded-2xl overflow-hidden flex gap-3 items-center p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      style={{ border: '1px solid var(--border)' }}>
      <div className="w-16 h-16 shrink-0 flex items-center justify-center rounded-xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        {product.images?.[0]
          ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-contain p-1" />
          : <div className="text-2xl opacity-20">📦</div>}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-black uppercase mb-0.5 truncate" style={{ color: 'var(--accent)', fontSize: '9px' }}>{product.brand}</p>
        <p className="text-xs font-semibold line-clamp-2 leading-tight" style={{ color: 'var(--text-primary)' }}>{product.name}</p>
        <p className="text-sm font-black mt-1" style={{ color: 'var(--accent)' }}>{formatPrice(product.price)}</p>
      </div>
      <button onClick={handleAdd}
        className="shrink-0 w-8 h-8 rounded-xl flex items-center justify-center text-white"
        style={{ background: 'var(--accent)' }}>
        <ShoppingCart size={13} />
      </button>
    </Link>
  )
}

interface Props { products: any[] }

export function MasonrySection({ products }: Props) {
  if (products.length < 4) return null

  // Layout: [grande, grande, pequeño, pequeño, pequeño, grande, pequeño, pequeño, pequeño]
  const big    = [products[0], products[1], products[5]].filter(Boolean)
  const small  = [products[2], products[3], products[4], products[6], products[7], products[8]].filter(Boolean)

  return (
    <section className="max-w-7xl mx-auto px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-1 h-6 rounded-full" style={{ background: 'var(--accent)' }} />
          <h2 className="text-base font-black" style={{ color: 'var(--text-primary)' }}>Destacados del momento</h2>
        </div>
        <Link href="/products" className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-xl"
          style={{ color: 'var(--accent)', border: '1px solid var(--accent)', background: 'var(--accent-bg)' }}>
          Ver todos
        </Link>
      </div>

      {/* Grid masonry: 3 columnas en desktop */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

        {/* Columna 1: 1 tarjeta grande */}
        {big[0] && (
          <div className="md:row-span-2">
            <BigCard product={big[0]} />
          </div>
        )}

        {/* Columna 2: 1 grande + 2 pequeñas */}
        <div className="flex flex-col gap-3">
          {big[1] && <BigCard product={big[1]} />}
          {small[0] && <SmallCard product={small[0]} />}
          {small[1] && <SmallCard product={small[1]} />}
        </div>

        {/* Columna 3: pequeñas + 1 grande */}
        <div className="flex flex-col gap-3">
          {small[2] && <SmallCard product={small[2]} />}
          {small[3] && <SmallCard product={small[3]} />}
          {big[2] && <BigCard product={big[2]} />}
        </div>

      </div>
    </section>
  )
}
