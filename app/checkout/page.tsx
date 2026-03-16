'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { PayPalButtons } from '@paypal/react-paypal-js'
import { CreditCard, Globe, Banknote, Phone, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()
  const [payMethod, setPayMethod] = useState<'bancard' | 'paypal' | 'transfer' | 'cash'>('bancard')
  const [address, setAddress] = useState({ street: '', city: '', department: 'Alto Paraná', phone: '' })
  const [loading, setLoading] = useState(false)

  const grandTotal = total()

  const createOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total: grandTotal, address }),
    })
    return res.json()
  }

  const handleBancard = async () => {
    if (!address.street) { toast.error('Completá la dirección de entrega'); return }
    setLoading(true)
    try {
      const order = await createOrder()
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'bancard', orderId: order.id, amount: grandTotal }),
      })
      const data = await res.json()
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl
      }
    } catch {
      toast.error('Error al procesar el pago')
    } finally {
      setLoading(false)
    }
  }

  const handleCash = async () => {
    if (!address.phone) { toast.error('Ingresá tu teléfono para coordinar'); return }
    setLoading(true)
    try {
      await createOrder()
      clearCart()
      router.push('/checkout/success?method=cash')
    } catch {
      toast.error('Error al crear el pedido')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-5xl">
      <h1 className="text-2xl font-black mb-8">Finalizar Compra</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: address + payment */}
        <div className="space-y-6">
          {/* Delivery address */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold mb-4">📍 Dirección de entrega</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Dirección completa *</label>
                <input value={address.street} onChange={e => setAddress(a => ({ ...a, street: e.target.value }))} placeholder="Calle, Número, Barrio" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Ciudad *</label>
                  <input value={address.city} onChange={e => setAddress(a => ({ ...a, city: e.target.value }))} placeholder="Ciudad del Este" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1.5">Departamento</label>
                  <select value={address.department} onChange={e => setAddress(a => ({ ...a, department: e.target.value }))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100">
                    {['Alto Paraná','Central','Asunción','Canindeyú','Itapúa','Cordillera','Guairá','Caaguazú'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Teléfono / WhatsApp *</label>
                <input value={address.phone} onChange={e => setAddress(a => ({ ...a, phone: e.target.value }))} placeholder="+595 9XX XXX XXX" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
              </div>
            </div>
          </div>

          {/* Payment method */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h2 className="font-bold mb-4">💳 Método de pago</h2>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'bancard', icon: <CreditCard size={18} />, label: 'Bancard', sub: 'Visa, Mastercard, Amex' },
                { id: 'paypal', icon: <Globe size={18} />, label: 'PayPal', sub: 'Pago internacional' },
                { id: 'transfer', icon: <Banknote size={18} />, label: 'Transferencia', sub: 'Banco / Tigo Money' },
                { id: 'cash', icon: <Phone size={18} />, label: 'Efectivo', sub: 'Coordinar por WhatsApp' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPayMethod(m.id as any)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    payMethod === m.id
                      ? 'border-cyan-500 bg-cyan-500/10'
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className={`mb-1 ${payMethod === m.id ? 'text-cyan-400' : 'text-gray-400'}`}>{m.icon}</div>
                  <div className="text-sm font-semibold">{m.label}</div>
                  <div className="text-xs text-gray-500">{m.sub}</div>
                </button>
              ))}
            </div>

            {/* Payment actions */}
            {payMethod === 'bancard' && (
              <button onClick={handleBancard} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold py-3.5 rounded-xl transition-colors">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Pagar con Bancard
              </button>
            )}

            {payMethod === 'paypal' && (
              <div className="rounded-xl overflow-hidden">
                <PayPalButtons
                  createOrder={async () => {
                    const order = await createOrder()
                    const res = await fetch('/api/payments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ method: 'paypal', orderId: order.id, amount: grandTotal }),
                    })
                    const data = await res.json()
                    return data.paypalOrderId
                  }}
                  onApprove={async (data) => {
                    clearCart()
                    router.push(`/checkout/success?orderId=${data.orderID}&method=paypal`)
                  }}
                />
              </div>
            )}

            {payMethod === 'transfer' && (
              <div className="bg-gray-800 rounded-xl p-4 text-sm">
                <p className="font-semibold mb-2">Datos para transferencia:</p>
                <p className="text-gray-300">Banco: <span className="text-white">Banco Continental</span></p>
                <p className="text-gray-300">Cuenta: <span className="text-white">0000-0000-00</span></p>
                <p className="text-gray-300">Tigo Money: <span className="text-white">+595 9XX XXX XXX</span></p>
                <p className="text-xs text-gray-500 mt-3">Enviá el comprobante a nuestro WhatsApp y confirmamos tu pedido en minutos.</p>
                <button onClick={handleCash} className="mt-3 w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2.5 rounded-xl text-sm transition-colors">
                  Confirmar pedido y enviar comprobante
                </button>
              </div>
            )}

            {payMethod === 'cash' && (
              <div>
                <div className="bg-gray-800 rounded-xl p-4 text-sm mb-3">
                  <p className="text-gray-300">Coordinamos la entrega o retiro en local por WhatsApp.</p>
                  <p className="text-xs text-gray-500 mt-1">Horario: Lun–Sáb 8:00–18:00 hs</p>
                </div>
                <button onClick={handleCash} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 text-white font-bold py-3.5 rounded-xl transition-colors">
                  {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                  Confirmar pedido (pago en efectivo)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: order summary */}
        <div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 sticky top-24">
            <h2 className="font-bold mb-4">Resumen del pedido</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-start text-sm">
                  <div className="flex-1 mr-4">
                    <p className="font-medium leading-tight">{item.name}</p>
                    <p className="text-xs text-gray-500">x{item.quantity}</p>
                  </div>
                  <p className="font-semibold shrink-0">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-400">
                <span>Subtotal</span><span>{formatPrice(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-400">
                <span>Envío</span><span className="text-green-400">Gratis</span>
              </div>
              <div className="flex justify-between font-black text-lg pt-2 border-t border-gray-800">
                <span>Total</span>
                <span className="text-green-400">{formatPrice(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
