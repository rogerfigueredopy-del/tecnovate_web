'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CreditCard, Banknote, Phone, Loader2, MapPin, ChevronDown, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

const DEPARTMENTS = [
  'Alto Paraná','Central','Asunción','Itapúa','Caaguazú',
  'Cordillera','Guairá','Paraguarí','Misiones','Ñeembucú',
  'Amambay','Canindeyú','Concepción','Presidente Hayes','Boquerón','Alto Paraguay',
]

const PAYMENT_METHODS = [
  { id: 'bancard',  icon: '💳', label: 'POS Bancard',          desc: 'Tarjeta en el momento de entrega' },
  { id: 'transfer', icon: '🏦', label: 'Transferencia bancaria', desc: 'Tigo Money, Personal Pay, banco' },
  { id: 'cash',     icon: '💵', label: 'Efectivo / WhatsApp',   desc: 'Coordinamos el pago con vos' },
] as const

type PayMethod = typeof PAYMENT_METHODS[number]['id']
const LIMIT_50_PCT = 10_000_000

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
const inputStyle = { border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }
const focusAccent = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--accent)')
const blurBorder  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--border)')

function Label({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>{children}</label>
}

export default function CheckoutPage() {
  const { data: session } = useSession()
  const { items, total, clearCart } = useCartStore()
  const router = useRouter()

  const [payMethod, setPayMethod] = useState<PayMethod>('transfer')
  const [address, setAddress] = useState({
    street: '', city: 'Asunción', department: 'Central', phone: '',
  })
  const [loading, setLoading] = useState(false)
  const grandTotal = total()
  const halfTotal = Math.round(grandTotal / 2)
  const requires50Pct = grandTotal > LIMIT_50_PCT

  const setAddr = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAddress(a => ({ ...a, [k]: e.target.value }))

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <p className="text-lg font-black mb-4" style={{ color: 'var(--text-primary)' }}>Tu carrito está vacío</p>
          <Link href="/products" className="px-6 py-3 rounded-xl font-black text-white text-sm"
            style={{ background: 'var(--accent)' }}>
            Ver productos
          </Link>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="text-center">
          <p className="text-lg font-black mb-2" style={{ color: 'var(--text-primary)' }}>Necesitás iniciar sesión</p>
          <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>para completar tu compra</p>
          <Link href="/login?callbackUrl=/checkout" className="px-6 py-3 rounded-xl font-black text-white text-sm"
            style={{ background: 'var(--accent)' }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    )
  }

  const createOrder = async () => {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, total: grandTotal, address }),
    })
    if (!res.ok) throw new Error('Error al crear pedido')
    return res.json()
  }

  const handleBancard = async () => {
    if (!address.street) { toast.error('Completá la dirección'); return }
    setLoading(true)
    try {
      const order = await createOrder()
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'bancard', orderId: order.id, amount: grandTotal }),
      })
      const data = await res.json()
      if (data.redirectUrl) window.location.href = data.redirectUrl
    } catch { toast.error('Error al procesar el pago') }
    finally { setLoading(false) }
  }

  const handleCash = async () => {
    if (!address.phone) { toast.error('Ingresá tu teléfono'); return }
    setLoading(true)
    try {
      const order = await createOrder()
      clearCart()
      router.push(`/checkout/success?orderId=${order.id}&method=cash`)
    } catch { toast.error('Error al crear el pedido') }
    finally { setLoading(false) }
  }

  const handleTransfer = async () => {
    if (!address.street) { toast.error('Completá la dirección'); return }
    setLoading(true)
    try {
      const order = await createOrder()
      clearCart()
      router.push(`/checkout/success?orderId=${order.id}&method=transfer`)
    } catch { toast.error('Error al crear el pedido') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>Finalizar Compra</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {items.length} producto{items.length !== 1 ? 's' : ''} · {formatPrice(grandTotal)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-bold" style={{ color: '#16a34a' }}>
            <Lock size={13} />
            Pago seguro
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Columna izquierda ──────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">

            {/* Dirección */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--border)' }}>
              <h2 className="font-black text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <MapPin size={17} style={{ color: 'var(--accent)' }} />
                Dirección de entrega
              </h2>
              <div className="space-y-3">
                <div>
                  <Label>Dirección completa *</Label>
                  <input value={address.street} onChange={setAddr('street')}
                    placeholder="Calle, Número, Barrio"
                    className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Ciudad *</Label>
                    <input value={address.city} onChange={setAddr('city')}
                      placeholder="Ciudad del Este"
                      className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                  </div>
                  <div>
                    <Label>Departamento</Label>
                    <div className="relative">
                      <select value={address.department} onChange={setAddr('department')}
                        className={`${inputCls} appearance-none pr-8`} style={inputStyle}
                        onFocus={focusAccent} onBlur={blurBorder}>
                        {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                </div>
                <div>
                  <Label>Teléfono / WhatsApp *</Label>
                  <input value={address.phone} onChange={setAddr('phone')}
                    placeholder="+595 9XX XXX XXX"
                    className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
                </div>
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--border)' }}>
              <h2 className="font-black text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <CreditCard size={17} style={{ color: 'var(--accent)' }} />
                Método de pago
              </h2>
              {/* Aviso 50% para compras > 10M */}
              {requires50Pct && (
                <div className="flex items-start gap-3 p-4 rounded-xl mb-4" style={{ background: '#fefce8', border: '1.5px solid #fde047' }}>
                  <span className="text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="font-black text-xs mb-1" style={{ color: '#854d0e' }}>Compra mayor a ₲ 10.000.000</p>
                    <p className="text-xs" style={{ color: '#713f12' }}>
                      Se requiere el <strong>50% ({formatPrice(halfTotal)})</strong> por transferencia bancaria antes del despacho.
                      El saldo restante puede abonarse antes del envío o contra entrega en Asunción.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 mb-5">
                {PAYMENT_METHODS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPayMethod(m.id)}
                    className="flex items-start gap-3 p-3.5 rounded-xl text-left transition-all hover:scale-[1.02]"
                    style={{
                      border: payMethod === m.id ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                      background: payMethod === m.id ? 'var(--accent-bg)' : 'white',
                    }}
                  >
                    <span className="text-xl mt-0.5">{m.icon}</span>
                    <div>
                      <p className="font-black text-xs" style={{ color: payMethod === m.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                        {m.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Info contextual por método */}
              {payMethod === 'bancard' && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                  <p className="font-black text-xs mb-1" style={{ color: 'var(--accent)' }}>POS Bancard — Terminal física</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Pagás con tu tarjeta en el momento de la entrega o retiro. Aceptamos Visa, Mastercard y Amex.
                    {requires50Pct && <strong style={{ color: '#854d0e' }}> Recordá que el 50% debe abonarse por transferencia antes del despacho.</strong>}
                  </p>
                </div>
              )}
              {payMethod === 'transfer' && (
                <div className="rounded-xl p-4 text-sm space-y-1" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                  <p className="font-black text-xs mb-2" style={{ color: 'var(--accent)' }}>Datos para transferencia</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>📱 Tigo Money / Personal Pay: <strong>+595 971 117 959</strong></p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>👤 Titular: <strong>Tecnovate</strong></p>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
                    Enviá el comprobante por WhatsApp al confirmar el pedido.
                    {requires50Pct && <strong style={{ color: '#854d0e' }}> Monto mínimo requerido: {formatPrice(halfTotal)}.</strong>}
                  </p>
                </div>
              )}
              {payMethod === 'cash' && (
                <div className="rounded-xl p-4 text-sm" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                  <p className="font-black text-xs mb-1" style={{ color: 'var(--accent)' }}>Coordinamos por WhatsApp</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    Confirmá el pedido y te contactamos para coordinar entrega o retiro.
                    {requires50Pct && <strong style={{ color: '#854d0e' }}> Atención: compras mayores a ₲ 10.000.000 requieren 50% por transferencia antes del despacho.</strong>}
                  </p>
                </div>
              )}

              {/* Botón de pago */}
              <div className="mt-5">
                {payMethod === 'bancard' && (
                  <button onClick={handleBancard} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <CreditCard size={16} />}
                    {loading ? 'Procesando...' : 'Confirmar pedido — POS Bancard'}
                  </button>
                )}

                {payMethod === 'transfer' && (
                  <button onClick={handleTransfer} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Banknote size={16} />}
                    {loading ? 'Procesando...' : requires50Pct ? `Confirmar pedido — Pagar ${formatPrice(halfTotal)} ahora` : 'Confirmar pedido — Transferencia'}
                  </button>
                )}

                {payMethod === 'cash' && (
                  <button onClick={handleCash} disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                    style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}>
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Phone size={16} />}
                    {loading ? 'Procesando...' : 'Confirmar pedido — Coordinamos por WhatsApp'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Resumen ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 sticky top-20" style={{ border: '1.5px solid var(--border)' }}>
              <h2 className="font-black text-base mb-4" style={{ color: 'var(--text-primary)' }}>Tu pedido</h2>

              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
                      style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                      {item.image
                        ? <img src={item.image} alt="" className="w-full h-full object-contain p-1" />
                        : <span className="text-lg">📦</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                        {item.name}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>× {item.quantity}</p>
                    </div>
                    <p className="text-sm font-black shrink-0" style={{ color: 'var(--text-primary)' }}>
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-4" style={{ borderTop: '1px solid var(--border)' }}>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Subtotal</span>
                  <span className="font-bold">{formatPrice(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span style={{ color: 'var(--text-muted)' }}>Envío</span>
                  <span className="font-black" style={{ color: '#16a34a' }}>Gratis</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4"
                style={{ borderTop: '2px solid var(--border)' }}>
                <span className="font-black" style={{ color: 'var(--text-primary)' }}>Total</span>
                <span className="font-black text-xl" style={{ color: 'var(--accent)' }}>
                  {formatPrice(grandTotal)}
                </span>
              </div>

              <div className="mt-5 space-y-1.5">
                {['🛡️ Compra 100% segura', '📦 Garantía oficial del fabricante', '💬 Soporte por WhatsApp'].map(g => (
                  <p key={g} className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{g}</p>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
