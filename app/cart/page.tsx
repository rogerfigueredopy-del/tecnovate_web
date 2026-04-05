'use client'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, ShoppingCart, Tag } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CartPage() {
  const { items, removeItem, updateQty, total, clearCart } = useCartStore()

  const subtotal   = total()
  const shipping   = 0
  const grandTotal = subtotal + shipping

  // ── Carrito vacío ─────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
        <div className="max-w-xl mx-auto px-6 py-24 text-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--accent-bg)' }}
          >
            <ShoppingCart size={40} style={{ color: 'var(--accent-light)' }} />
          </div>
          <h2 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>
            Tu carrito está vacío
          </h2>
          <p className="mb-7 text-sm" style={{ color: 'var(--text-muted)' }}>
            Agregá productos para continuar con tu compra
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
          >
            <ShoppingBag size={16} />
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              Mi Carrito
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => clearCart()}
            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
            style={{ color: '#dc2626', background: '#fff5f5', border: '1px solid #fecaca' }}
          >
            Vaciar carrito
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Lista de items ─────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            {items.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-4 flex items-center gap-4 transition-all hover:shadow-sm"
                style={{ border: '1.5px solid var(--border)' }}
              >
                {/* Imagen */}
                <Link href={`/products/${item.slug}`}>
                  <div
                    className="w-20 h-20 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={80} height={80}
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black uppercase mb-0.5" style={{ color: 'var(--accent)', fontSize: '11px' }}>
                    {item.brand}
                  </p>
                  <Link href={`/products/${item.slug}`}>
                    <p className="font-bold text-sm leading-snug line-clamp-2 hover:underline" style={{ color: 'var(--text-primary)' }}>
                      {item.name}
                    </p>
                  </Link>
                  <p className="font-black text-base mt-1" style={{ color: 'var(--accent)' }}>
                    {formatPrice(item.price)}
                  </p>
                </div>

                {/* Controles */}
                <div className="flex flex-col items-end gap-3 shrink-0">
                  {/* Qty */}
                  <div
                    className="flex items-center gap-1 rounded-xl p-1"
                    style={{ border: '1.5px solid var(--border)', background: 'white' }}
                  >
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-8 text-center font-black text-sm" style={{ color: 'var(--text-primary)' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-50"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Plus size={13} />
                    </button>
                  </div>

                  {/* Subtotal + eliminar */}
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="w-7 h-7 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                      style={{ background: '#fff5f5', color: '#dc2626' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Seguir comprando */}
            <Link
              href="/products"
              className="flex items-center gap-2 text-sm font-bold py-3 transition-colors"
              style={{ color: 'var(--accent)' }}
            >
              ← Seguir comprando
            </Link>
          </div>

          {/* ── Resumen ────────────────────────────────────── */}
          <div className="space-y-4">

            {/* Resumen del pedido */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--border)' }}>
              <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>
                Resumen del pedido
              </h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="truncate max-w-[160px]" style={{ color: 'var(--text-secondary)' }}>
                      {item.name.split(' ').slice(0, 3).join(' ')}… × {item.quantity}
                    </span>
                    <span className="font-bold shrink-0 ml-2" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Envío</span>
                  <span className="font-black" style={{ color: '#16a34a' }}>Gratis 🎉</span>
                </div>
              </div>

              <div
                className="flex justify-between items-center mt-4 pt-4"
                style={{ borderTop: '2px solid var(--border)' }}
              >
                <span className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="font-black text-xl" style={{ color: 'var(--accent)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-5 w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02]"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
              >
                Ir al checkout
                <ArrowRight size={16} />
              </Link>
            </div>

            {/* Métodos de pago aceptados */}
            <div className="bg-white rounded-2xl p-5" style={{ border: '1.5px solid var(--border)' }}>
              <p className="text-xs font-black mb-3" style={{ color: 'var(--text-muted)' }}>
                MÉTODOS DE PAGO ACEPTADOS
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: '💳', label: 'Bancard' },
                  { icon: '🌐', label: 'PayPal' },
                  { icon: '📱', label: 'Tigo Money' },
                  { icon: '💵', label: 'Efectivo' },
                ].map(m => (
                  <div
                    key={m.label}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold"
                    style={{ background: 'var(--accent-bg)', color: 'var(--text-secondary)' }}
                  >
                    <span>{m.icon}</span>
                    {m.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Garantías */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              {[
                '🛡️ Compra 100% segura',
                '🚚 Envíos a todo Paraguay',
                '📦 Garantía oficial del fabricante',
              ].map(g => (
                <p key={g} className="text-xs font-semibold py-1" style={{ color: 'var(--text-secondary)' }}>{g}</p>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
