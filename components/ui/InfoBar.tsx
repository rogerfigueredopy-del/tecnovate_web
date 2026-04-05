'use client'
import { Truck, CreditCard, ShieldCheck, MessageCircle } from 'lucide-react'

const ITEMS = [
  { icon: Truck,          title: 'Envíos a todo Paraguay', desc: '24 h Asunción · 2-5 días interior' },
  { icon: CreditCard,     title: 'Pagos seguros',          desc: 'POS Bancard · Transferencia · Efectivo' },
  { icon: ShieldCheck,    title: 'Garantía oficial',       desc: 'Todos los productos' },
  { icon: MessageCircle,  title: 'Soporte real',           desc: 'Equipo disponible por WhatsApp' },
]

export function InfoBar() {
  return (
    <div className="bg-white border-y" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {ITEMS.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex items-center gap-3 py-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}
            >
              <Icon size={20} strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm" style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '13px' }}>
                {title}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
