import Link from 'next/link'

export default function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { orderId?: string; method?: string }
}) {
  const { orderId, method } = searchParams

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="text-7xl mb-6">🎉</div>
      <h1 className="text-3xl font-black mb-3 text-white">¡Pedido confirmado!</h1>
      <p className="text-gray-400 mb-2">
        {method === 'cash'
          ? 'Nos ponemos en contacto por WhatsApp para coordinar la entrega o retiro.'
          : method === 'paypal'
          ? 'Tu pago fue procesado exitosamente por PayPal.'
          : 'Tu pago fue procesado exitosamente.'}
      </p>
      {orderId && (
        <p className="text-sm text-gray-500 mb-8">
          Número de pedido: <span className="font-mono text-cyan-400">#{orderId.slice(-8).toUpperCase()}</span>
        </p>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold mb-3">¿Qué sigue?</h3>
        <div className="space-y-3">
          {[
            { step: '1', text: 'Revisamos tu pedido y lo preparamos' },
            { step: '2', text: 'Te notificamos cuando esté listo para envío' },
            { step: '3', text: 'Recibís tu pedido en la dirección indicada' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-gray-300">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <Link
          href="/orders"
          className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Ver mis pedidos
        </Link>
        <Link
          href="/products"
          className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-xl transition-colors"
        >
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
