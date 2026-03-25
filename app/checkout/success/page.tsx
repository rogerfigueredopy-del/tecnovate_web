import Link from 'next/link'
import { CheckCircle, Package, Truck, Bell, MessageCircle } from 'lucide-react'

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; method?: string }
}) {
  const { orderId, method } = searchParams

  const METHOD_INFO: Record<string, { icon: string; title: string; desc: string }> = {
    bancard: {
      icon: '💳',
      title: '¡Pago confirmado!',
      desc: 'Tu pago con Bancard fue procesado exitosamente.',
    },
    paypal: {
      icon: '🌐',
      title: '¡Pago confirmado!',
      desc: 'Tu pago con PayPal fue procesado exitosamente.',
    },
    transfer: {
      icon: '📱',
      title: '¡Pedido recibido!',
      desc: 'Envianos el comprobante de Tigo Money por WhatsApp para confirmar tu pedido.',
    },
    cash: {
      icon: '💵',
      title: '¡Pedido recibido!',
      desc: 'Nos comunicamos por WhatsApp para coordinar la entrega o el retiro en local.',
    },
  }

  const info = METHOD_INFO[method || ''] || {
    icon: '🎉',
    title: '¡Pedido confirmado!',
    desc: 'Tu pedido fue procesado exitosamente.',
  }

  const STEPS = [
    { icon: Package, label: 'Revisamos tu pedido',         done: true },
    { icon: Truck,   label: 'Lo preparamos y enviamos',    done: false },
    { icon: Bell,    label: 'Te notificamos el seguimiento', done: false },
    { icon: CheckCircle, label: 'Lo recibís en tu domicilio', done: false },
  ]

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16 text-center"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative">
          <div className="text-6xl mb-4">{info.icon}</div>
          <h1 className="text-3xl font-black text-white mb-2">{info.title}</h1>
          <p className="text-sm opacity-80 max-w-md mx-auto px-6" style={{ color: 'rgba(255,255,255,0.8)' }}>
            {info.desc}
          </p>
          {orderId && (
            <div className="mt-4 inline-block px-4 py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
              <p className="text-xs text-white opacity-70">Número de pedido</p>
              <p className="font-mono font-black text-white">#{orderId.slice(-10).toUpperCase()}</p>
            </div>
          )}
        </div>
      </section>

      <div className="max-w-lg mx-auto px-6 py-10 space-y-5">

        {/* ── Pasos siguientes ──────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1.5px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>¿Qué sigue?</h2>
          <div className="space-y-0">
            {STEPS.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: step.done ? 'var(--accent)' : 'var(--bg-secondary)',
                        border: `2px solid ${step.done ? 'var(--accent)' : 'var(--border)'}`,
                      }}
                    >
                      <Icon size={16} style={{ color: step.done ? 'white' : 'var(--text-muted)' }} />
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className="w-0.5 h-6 my-1" style={{ background: 'var(--border)' }} />
                    )}
                  </div>
                  <div className="pb-5 pt-1.5">
                    <p className="text-sm font-bold" style={{ color: step.done ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                      {step.label}
                      {step.done && (
                        <span className="ml-2 text-xs font-black px-2 py-0.5 rounded-lg"
                          style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                          Listo ✓
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── WhatsApp si corresponde ────────────────────────── */}
        {(method === 'cash' || method === 'transfer') && (
          <a
            href="https://wa.me/595984000001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-black text-white text-sm transition-all hover:scale-[1.02]"
            style={{ background: '#22c55e', boxShadow: '0 4px 14px rgba(34,197,94,0.3)' }}
          >
            <MessageCircle size={16} />
            {method === 'transfer' ? 'Enviar comprobante por WhatsApp' : 'Coordinar entrega por WhatsApp'}
          </a>
        )}

        {/* ── Botones de navegación ─────────────────────────── */}
        <div className="flex gap-3">
          <Link
            href="/orders"
            className="flex-1 flex items-center justify-center py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02]"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
          >
            Ver mis pedidos
          </Link>
          <Link
            href="/products"
            className="flex-1 flex items-center justify-center py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02]"
            style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
          >
            Seguir comprando
          </Link>
        </div>

      </div>
    </div>
  )
}
