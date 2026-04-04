import { CreditCard, Banknote, Smartphone, ShieldCheck, AlertCircle } from 'lucide-react'

const METHODS = [
  { icon: CreditCard, title: 'Tarjetas de crédito y débito', desc: 'Todas las principales marcas: Visa, Mastercard, American Express.' },
  { icon: Banknote,   title: 'Transferencia bancaria',       desc: 'Transferencia a cuenta bancaria local. Te enviamos los datos al confirmar el pedido.' },
  { icon: Smartphone, title: 'Pago móvil (billeteras)',      desc: 'Tigo Money, Personal Pay y otras billeteras digitales paraguayas.' },
  { icon: Banknote,   title: 'Efectivo',                    desc: 'Pago en efectivo coordinado con nuestro equipo. Disponible para retiros en Asunción.' },
]

export default function PaymentsPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Métodos de pago</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Facilitamos todas las opciones para que puedas comprar con comodidad</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {/* Aviso 50% */}
        <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: '#fefce8', border: '1.5px solid #fde047' }}>
          <AlertCircle size={22} style={{ color: '#854d0e', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-black mb-1" style={{ color: '#854d0e' }}>Pago parcial requerido antes del envío</p>
            <p className="text-sm" style={{ color: '#713f12' }}>
              Para confirmar y despachar tu pedido se requiere el <strong>50% del valor total</strong> por adelantado.
              El saldo restante puede abonarse antes del envío o contra entrega en Asunción y Gran Asunción (previa coordinación).
            </p>
          </div>
        </div>

        {/* Métodos */}
        <div className="bg-white rounded-2xl p-7" style={{ border: '1.5px solid var(--border)' }}>
          <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Medios disponibles</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {METHODS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-4 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-bg)' }}>
                  <Icon size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="font-bold text-sm mb-0.5" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Seguridad */}
        <div className="flex items-start gap-4 p-5 rounded-2xl" style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-light)' }}>
          <ShieldCheck size={22} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
          <div>
            <p className="font-black mb-1" style={{ color: 'var(--accent)' }}>Compra 100% segura</p>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Todos los pagos son procesados en entornos encriptados y seguros.
              No almacenamos datos de tarjetas. Podés comprar con total confianza.
            </p>
          </div>
        </div>

        {/* Mayoristas */}
        <div className="bg-white rounded-2xl p-7" style={{ border: '1.5px solid var(--border)' }}>
          <h2 className="text-lg font-black mb-3" style={{ color: 'var(--text-primary)' }}>Consultas de mayoristas</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
            ¿Querés comprar al por mayor? Ofrecemos precios especiales para compras grandes o recurrentes,
            stock reservado y soporte dedicado. Estamos comprometidos a establecer relaciones sólidas
            basadas en la transparencia y el crecimiento conjunto.
          </p>
          <a href="https://wa.me/595971117959?text=Hola!%20Quiero%20consultar%20precios%20mayoristas."
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ background: '#25d366' }}>
            Consultar por WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}
