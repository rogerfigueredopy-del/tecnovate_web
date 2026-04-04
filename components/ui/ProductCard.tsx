'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Heart } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice, fullImg } from '@/lib/utils'
import { useExchangeRate } from '@/components/ui/ExchangeRate'
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
  specs?: any
  category: { name: string; slug: string }
}

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore(s => s.addItem)
  const { rate } = useExchangeRate()

  const priceUSD = product.specs?.priceUSD
    ? parseFloat(product.specs.priceUSD)
    : parseFloat((product.price / (rate || 7700)).toFixed(0))

  const discount = product.oldPrice && product.oldPrice > product.price
    ? Math.round((1 - product.price / product.oldPrice) * 100) : null

  const formatUSD = (n: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addItem({ id: product.id, name: product.name, brand: product.brand, price: product.price, image: product.images[0] || '', slug: product.slug })
    toast.success('¡Agregado al carrito!')
  }

  return (
    <Link href={`/products/${product.slug}`}>
      <div
        className="group bg-white rounded-xl overflow-hidden cursor-pointer flex flex-col h-full"
        style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)', transition: 'all 0.2s' }}
        onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--accent)'; el.style.transform='translateY(-3px)'; el.style.boxShadow='0 8px 32px rgba(183,105,189,0.15)' }}
        onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor='var(--border)'; el.style.transform='translateY(0)'; el.style.boxShadow='var(--shadow)' }}
      >
        <div className="relative bg-white" style={{ aspectRatio: '1', padding: '8px' }}>
          {product.images[0] ? (
            <Image src={fullImg(product.images[0])} alt={product.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 768px) 50vw, 20vw" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl" style={{ color: '#ddd' }}>📦</div>
          )}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {discount && discount > 0 && <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#dc2626', fontSize: '10px' }}>-{discount}%</span>}
            {product.stock === 0 && <span className="text-white text-xs font-bold px-2 py-0.5 rounded bg-gray-400" style={{ fontSize: '10px' }}>Sin stock</span>}
          </div>
          <button onClick={e => { e.preventDefault(); toast('♡ Favoritos') }} className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow border" style={{ borderColor: 'var(--border)' }}>
            <Heart size={13} style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
        <div className="p-3 flex flex-col flex-1">
          <p className="font-700 uppercase tracking-wide mb-1" style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '10px' }}>{product.brand}</p>
          <h3 className="leading-snug mb-2 flex-1 line-clamp-2" style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '13px' }}>{product.name}</h3>
          <div className="mt-auto">
            {product.oldPrice && product.oldPrice > product.price && (
              <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>{formatPrice(product.oldPrice)}</p>
            )}
            <p className="font-800" style={{ color: 'var(--accent)', fontWeight: 800, fontSize: '16px' }}>{formatUSD(priceUSD)}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>≈ {formatPrice(product.price)}</p>
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === 0}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-white text-xs font-700 transition-all disabled:opacity-40"
            style={{ background: product.stock === 0 ? '#ccc' : 'var(--accent)', fontWeight: 700 }}
            onMouseEnter={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background='var(--accent-dark)' }}
            onMouseLeave={e => { if (product.stock > 0) (e.currentTarget as HTMLButtonElement).style.background='var(--accent)' }}
          >
            <ShoppingCart size={13} />
            {product.stock === 0 ? 'Sin stock' : 'Agregar'}
          </button>
        </div>
      </div>
    </Link>
  )
}
