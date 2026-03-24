'use client'
import { useEffect, useState } from 'react'
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import toast from 'react-hot-toast'

// Wishlist local (localStorage) - si querés persistir en DB podés extenderlo
function useWishlistStore() {
  const [items, setItems] = useState<any[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tecnovate-wishlist')
      if (stored) setItems(JSON.parse(stored))
    } catch {}
    setLoaded(true)
  }, [])

  const remove = (id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id)
      localStorage.setItem('tecnovate-wishlist', JSON.stringify(next))
      return next
    })
  }

  const clear = () => {
    setItems([])
    localStorage.removeItem('tecnovate-wishlist')
  }

  return { items, remove, clear, loaded }
}

export default function WishlistPage() {
  const { items, remove, clear, loaded } = useWishlistStore()
  const addItem = useCartStore(s => s.addItem)
  const { data: session } = useSession()

  const handleAddToCart = (product: any) => {
    addItem({
      id: product.id,
      name: product.name,
      brand: product.brand || '',
      price: product.price,
      image: product.images?.[0] || product.image || '',
      slug: product.slug,
    })
    toast.success('¡Agregado al carrito!')
  }

  const handleAddAllToCart = () => {
    items.forEach(p => handleAddToCart(p))
    toast.success(`${items.length} productos agregados al carrito!`)
  }

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)' }} />
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-12"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="text-white">
            <div className="flex items-center gap-3 mb-1">
              <Heart size={24} fill="white" />
              <h1 className="text-3xl font-black">Mis Favoritos</h1>
            </div>
            <p className="opacity-75 text-sm">{items.length} producto{items.length !== 1 ? 's' : ''} guardado{items.length !== 1 ? 's' : ''}</p>
          </div>
          {items.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleAddAllToCart}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                style={{ background: 'white', color: '#7b2d9e' }}
              >
                <ShoppingCart size={15} />
                Agregar todo al carrito
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">

        {/* ── Sin favoritos ────────────────────────────────── */}
        {items.length === 0 && (
          <div className="text-center py-24">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
              style={{ background: 'var(--accent-bg)' }}
            >
              <Heart size={40} style={{ color: 'var(--accent-light)' }} />
            </div>
            <h2 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Tu lista de favoritos está vacía</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Guardá los productos que te interesan tocando el corazón ♡
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
              style={{ background: 'var(--accent)' }}
            >
              Ver productos
              <ArrowRight size={15} />
            </Link>
          </div>
        )}

        {/* ── Grid de favoritos ────────────────────────────── */}
        {items.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map(product => {
                const discount = product.oldPrice
                  ? Math.round((1 - product.price / product.oldPrice) * 100)
                  : null

                return (
                  <div
                    key={product.id}
                    className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all hover:-translate-y-1 hover:shadow-lg"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {/* Image */}
                    <Link href={`/products/${product.slug}`} className="relative block" style={{ aspectRatio: '1', padding: '12px', background: 'white' }}>
                      {product.images?.[0] || product.image ? (
                        <img
                          src={product.images?.[0] || product.image}
                          alt={product.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">📦</div>
                      )}
                      {discount && discount > 0 && (
                        <span className="absolute top-2 left-2 text-white text-xs font-black px-2 py-0.5 rounded-lg"
                          style={{ background: '#dc2626', fontSize: '11px' }}>
                          -{discount}%
                        </span>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs font-black uppercase mb-1" style={{ color: 'var(--accent)', fontSize: '11px' }}>
                        {product.brand}
                      </p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-sm leading-snug mb-2 line-clamp-2 hover:underline" style={{ color: 'var(--text-primary)' }}>
                          {product.name}
                        </h3>
                      </Link>
                      <div className="mt-auto">
                        {product.oldPrice && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                            {formatPrice(product.oldPrice)}
                          </p>
                        )}
                        <p className="text-base font-black" style={{ color: 'var(--accent)' }}>
                          {formatPrice(product.price)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-white text-xs font-black transition-all hover:opacity-90"
                          style={{ background: 'var(--accent)' }}
                        >
                          <ShoppingCart size={12} />
                          Agregar
                        </button>
                        <button
                          onClick={() => { remove(product.id); toast('Eliminado de favoritos') }}
                          className="w-9 h-9 flex items-center justify-center rounded-xl transition-all hover:scale-110"
                          style={{ background: '#fff5f5', border: '1px solid #fecaca' }}
                        >
                          <Trash2 size={14} className="text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Clear all */}
            <div className="text-center mt-8">
              <button
                onClick={() => { clear(); toast('Lista de favoritos vaciada') }}
                className="text-xs font-black px-4 py-2 rounded-xl transition-all hover:scale-105"
                style={{ color: 'var(--text-muted)', border: '1px solid var(--border)', background: 'white' }}
              >
                Vaciar lista
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
