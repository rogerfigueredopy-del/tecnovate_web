'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Product {
  id: string
  name: string
  slug: string
  brand: string
  price: number
  oldPrice?: number | null
  images: string[]
  stock: number
  category: { name: string; slug: string }
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : null

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0] || '',
      slug: product.slug,
    })
    toast.success('¡Agregado al carrito!')
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group bg-white rounded-xl overflow-hidden cursor-pointer transition-all duration-250 flex flex-col h-full"
        style={{
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow)',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 32px rgba(183,105,189,0.15)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
          ;(e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)'
          ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow)'
        }}
      >
        {/* Image */}
        <div className="relative bg-white" style={{ aspectRatio: '1', padding: '12px' }}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">📦</div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && discount > 0 && (
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#dc2626', fontSize: '11px' }}>
                -{discount}%
              </span>
            )}
            {product.stock === 0 && (
              <span className="text-white text-xs font-bold px-2 py-0.5 rounded bg-gray-500" style={{ fontSize: '11px' }}>
                Sin stock
              </span>
            )}
          </div>

          {/* Wishlist button */}
          <button
            onClick={e => { e.preventDefault(); toast('♡ Agregado a favoritos') }}
            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md border"
            style={{ borderColor: 'var(--border)' }}
          >
            <Heart size={14} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>

        {/* Info */}
        <div className="p-3 flex flex-col flex-1">
          <p className="text-xs font-700 uppercase tracking-wide mb-1" style={{ color: 'var(--accent)', fontSize: '11px', fontWeight: 700 }}>
            {product.brand}
          </p>
          <h3 className="text-sm leading-snug mb-2 flex-1 line-clamp-2" style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
            {product.name}
          </h3>

          {/* Price */}
          <div className="mt-auto">
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                {formatPrice(product.oldPrice)}
              </p>
            )}
            <p className="text-base font-800" style={{ color: 'var(--accent)', fontWeight: 800 }}>
              {formatPrice(product.price)}
            </p>
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-700 transition-all disabled:opacity-40"
            style={{
              background: product.stock === 0 ? '#ccc' : 'var(--accent)',
              fontWeight: 700,
            }}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent-dark)' }}
            onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background = 'var(--accent)' }}
          >
            <ShoppingCart size={15} />
            {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
          </button>
        </div>
      </div>
    </Link>
  )
}
