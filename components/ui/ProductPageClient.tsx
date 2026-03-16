'use client'
import { useState } from 'react'
import { ShoppingCart, Heart, Share2, Minus, Plus } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
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
  const addItem = useCartStore(s => s.addItem)

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
    toast.success(`${qty} × ${product.name.slice(0, 30)}... agregado al carrito 🛒`)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copiado al portapapeles')
    }
  }

  return (
    <div className="space-y-4">
      {/* Qty selector */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl p-1">
          <button
            onClick={() => setQty(q => Math.max(1, q - 1))}
            className="w-9 h-9 rounded-lg hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold">{qty}</span>
          <button
            onClick={() => setQty(q => Math.min(product.stock, q + 1))}
            disabled={qty >= product.stock}
            className="w-9 h-9 rounded-lg hover:bg-gray-800 disabled:opacity-30 flex items-center justify-center transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <span className="text-xs text-gray-500">{product.stock} disponibles</span>
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="flex-1 flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold py-3.5 rounded-xl transition-colors"
        >
          <ShoppingCart size={18} />
          {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>

        <button
          onClick={() => toast('Agregado a favoritos ♡')}
          className="p-3.5 bg-gray-900 border border-gray-700 hover:border-red-500 hover:text-red-400 rounded-xl transition-colors"
        >
          <Heart size={18} />
        </button>

        <button
          onClick={handleShare}
          className="p-3.5 bg-gray-900 border border-gray-700 hover:border-cyan-500 hover:text-cyan-400 rounded-xl transition-colors"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Shipping info */}
      <div className="grid grid-cols-3 gap-3 text-center">
        {[
          { icon: '🚚', text: 'Envío gratis +Gs. 2M' },
          { icon: '🔄', text: 'Devolución 30 días' },
          { icon: '🔒', text: 'Pago seguro' },
        ].map(i => (
          <div key={i.text} className="bg-gray-900 border border-gray-800 rounded-xl py-3 px-2">
            <div className="text-xl mb-1">{i.icon}</div>
            <div className="text-xs text-gray-400 leading-tight">{i.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
