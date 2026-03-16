'use client'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-400 mb-6">Agregá productos para continuar</p>
        <Link href="/products" className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors">
          <ShoppingBag size={18} />
          Ver productos
        </Link>
      </div>
    )
  }

  const subtotal = total()
  const shipping = 0 // gratis
  const grandTotal = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-black mb-8">Mi Carrito ({items.length} productos)</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              {/* Image */}
              <div className="w-20 h-20 bg-gray-800 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                {item.image ? (
                  <Image src={item.image} alt={item.name} width={80} height={80} className="object-contain" />
                ) : (
                  <span className="text-3xl">📦</span>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-cyan-400 font-semibold">{item.brand}</p>
                <p className="font-semibold text-sm truncate">{item.name}</p>
                <p className="text-green-400 font-bold mt-1">{formatPrice(item.price)}</p>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0 min-w-[90px]">
                <p className="font-bold text-white">{formatPrice(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id)} className="text-gray-600 hover:text-red-400 mt-1 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}

          <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-400 transition-colors mt-2">
            × Vaciar carrito
          </button>
        </div>

        {/* Order summary */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
            <h2 className="font-bold mb-4">Resumen del pedido</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal ({items.reduce((n, i) => n + i.quantity, 0)} items)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Envío</span>
                <span className="text-green-400">Gratis</span>
              </div>
            </div>

            <div className="border-t border-gray-800 pt-4 mb-6">
              <div className="flex justify-between font-black text-lg">
                <span>Total</span>
                <span className="text-green-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3.5 rounded-xl transition-colors"
            >
              Continuar al pago
              <ArrowRight size={18} />
            </Link>

            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              {['💳 Bancard', '🌐 PayPal', '💵 Efectivo'].map(m => (
                <div key={m} className="bg-gray-800 rounded-lg py-2 text-xs text-gray-400">{m}</div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-3">🔒 Pago 100% seguro y encriptado</p>
          </div>
        </div>
      </div>
    </div>
  )
}
