'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Star } from 'lucide-react'
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
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand,
      price: product.price,
      image: product.images[0] || '/placeholder.png',
      slug: product.slug,
    })
    toast.success('Agregado al carrito 🛒')
  }

  return (
    <Link href={`/products/${product.slug}`} className="group">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/50 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-500/5">
        {/* Image */}
        <div className="relative aspect-square bg-gray-800 overflow-hidden">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl text-gray-600">📦</div>
          )}
          {discount && (
            <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
              -{discount}%
            </span>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-gray-300 font-semibold text-sm bg-gray-900 px-4 py-2 rounded-lg">Sin stock</span>
            </div>
          )}
          <button
            onClick={e => { e.preventDefault(); toast('Agregado a favoritos ♡') }}
            className="absolute top-3 right-3 p-2 bg-gray-900/80 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-800"
          >
            <Heart size={16} className="text-gray-400 hover:text-red-400" />
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wide mb-1">{product.brand}</p>
          <h3 className="text-sm font-semibold text-gray-100 leading-snug mb-3 line-clamp-2 group-hover:text-white">
            {product.name}
          </h3>

          <div className="flex items-end justify-between">
            <div>
              {product.oldPrice && (
                <p className="text-xs text-gray-500 line-through">{formatPrice(product.oldPrice)}</p>
              )}
              <p className="text-lg font-bold text-green-400">{formatPrice(product.price)}</p>
            </div>
            <button
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="p-2.5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black rounded-xl transition-colors"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
