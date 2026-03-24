'use client'
import { useState } from 'react'
import { ShoppingCart, Heart, Share2, Minus, Plus, Zap } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Props {
  product: {
    id: string
    name: string
    brand: string
    price: number
    image: string
    slug: string
    stock: number
  }
}

export function ProductPageClient({ product }: Props) {
  const [qty, setQty] = useState(1)
  const [wishlisted, setWishlisted] = useState(false)
  const addItem = useCartStore(s => s.addItem)
  const router = useRouter()

  const handleAdd = () => {
    for (let i = 0; i < qty; i++) {
      addItem({
        id: product.id,
        name: product.name,
        brand: product.brand,
        price: product.price,
        image: product.image || '',
        slug: product.slug,
      })
    }
    toast.success(`${qty > 1 ? `${qty} ×` : ''} Agregado al carrito 🛒`)
  }

  const handleBuyNow = () => {
    handleAdd()
    router.push('/cart')
  }

  const handleWishlist = () => {
    try {
      const stored = localStorage.getItem('tecnovate-wishlist')
      const items = stored ? JSON.parse(stored) : []
      if (!items.find((i: any) => i.id === product.id)) {
        items.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          image: product.image,
          slug: product.slug,
        })
        localStorage.setItem('tecnovate-wishlist', JSON.stringify(items))
      }
    } catch {}
    setWishlisted(true)
    toast.success('Agregado a favoritos ♡')
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado!')
    }
  }

  return (
    <div className="space-y-4">

      {/* Cantidad */}
      <div className="flex items-center gap-4">
        <p className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>Cantidad:</p>
        <div
          className="flex items-center gap-1 rounded-xl p-1"
          style={{ border: '1.5px solid var(--border)', background: 'white' }}
        >
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg transition-colors hover:bg-gray-50"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Minus size={14} />
          </button>
          <span className="w-10 text-center font-black text-base" style={{ color: 'var(--text-primary)' }}>
            {qty}
          </span>
          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black transition-colors hover:bg-gray-50 disabled:opacity-30"
            style={{ color: 'var(--text-secondary)' }}
          >
            <Plus size={14} />
          </button>
        </div>
        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
          {product.stock} disponibles
        </span>
      </div>

      {/* Botones principales */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--accent)', color: 'white', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
        >
          <ShoppingCart size={16} />
          {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
        <button
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
          style={{ background: 'var(--accent-dark)', color: 'white', boxShadow: '0 4px 14px rgba(155,79,166,0.3)' }}
        >
          <Zap size={16} />
          Comprar ahora
        </button>
      </div>

      {/* Acciones secundarias */}
      <div className="flex gap-2">
        <button
          onClick={handleWishlist}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{
            border: '1.5px solid var(--border)',
            background: wishlisted ? 'var(--accent-bg)' : 'white',
            color: wishlisted ? 'var(--accent)' : 'var(--text-secondary)',
          }}
        >
          <Heart size={15} fill={wishlisted ? 'var(--accent)' : 'none'} />
          {wishlisted ? 'En favoritos' : 'Favoritos'}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
          style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-secondary)' }}
        >
          <Share2 size={15} />
          Compartir
        </button>
      </div>

      {/* WhatsApp consulta */}
      <a
        href={`https://wa.me/595984000001?text=Hola! Consulta sobre: ${encodeURIComponent(product.name)} — ${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
        style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#15803d' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="#15803d">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        Consultar por WhatsApp
      </a>
    </div>
  )
}
