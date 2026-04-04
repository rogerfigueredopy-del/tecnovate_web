'use client'
import { useState } from 'react'
import { ChevronDown, MessageCircle } from 'lucide-react'

const FAQS = [
  {
    category: 'Compras y pedidos',
    items: [
      {
        q: '¿Cómo realizo una compra?',
        a: 'Podés comprar directamente desde el sitio web agregando productos al carrito y completando el proceso de pago, o contactarnos por WhatsApp para coordinar el pedido.',
      },
      {
        q: '¿Los precios están en Guaraníes?',
        a: 'Sí, todos los precios publicados en el sitio están en Guaraníes paraguayos (₲). También mostramos el equivalente en dólares (U$S) como referencia, calculado al tipo de cambio vigente.',
      },
      {
        q: '¿Puedo hacer una reserva de producto?',
        a: 'Sí. Con el pago del 50% del valor total podés reservar el producto y asegurar el stock. Coordiná con nuestro equipo por WhatsApp.',
      },
      {
        q: '¿Hacen facturas?',
        a: 'Sí, emitimos comprobante de compra. Si necesitás factura con RUC, indicalo al momento de coordinar el pedido.',
      },
    ],
  },
  {
    category: 'Pagos',
    items: [
      {
        q: '¿Qué métodos de pago aceptan?',
        a: 'Aceptamos tarjetas de crédito y débito (Visa, Mastercard, Amex), transferencia bancaria, billeteras digitales (Tigo Money, Personal Pay) y efectivo para retiros en Asunción.',
      },
      {
        q: '¿Por qué debo pagar el 50% por adelantado?',
        a: 'El pago parcial anticipado nos permite confirmar el pedido, reservar el stock y gestionar el despacho. El 50% restante puede abonarse antes del envío o contra entrega en Asunción y Gran Asunción.',
      },
      {
        q: '¿Es seguro pagar por el sitio?',
        a: 'Sí. Todos los pagos son procesados en entornos encriptados. No almacenamos datos de tarjetas en nuestros servidores.',
      },
    ],
  },
  {
    category: 'Envíos',
    items: [
      {
        q: '¿A dónde envían?',
        a: 'Enviamos a todo Paraguay. Asunción y Gran Asunción tienen entrega en 24 horas hábiles. El interior del país tiene un plazo estimado de 2 a 5 días hábiles.',
      },
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El costo de envío se informa antes de finalizar la compra y depende de la zona y el peso del paquete.',
      },
      {
        q: '¿Puedo retirar en persona?',
        a: 'Sí, podés coordinar el retiro en Asunción. Consultanos por WhatsApp para acordar el punto y horario de entrega.',
      },
      {
        q: '¿Qué pasa si no estoy cuando llega el paquete?',
        a: 'Si el paquete no puede ser entregado por ausencia o dirección incorrecta, será devuelto. El cliente deberá abonar el costo de un nuevo envío.',
      },
    ],
  },
  {
    category: 'Devoluciones y garantía',
    items: [
      {
        q: '¿Puedo devolver un producto?',
        a: 'Aceptamos devoluciones o cambios únicamente dentro de las 24 horas corridas de recibido el producto, siempre que esté en perfecto estado, con empaque original cerrado y todos sus accesorios.',
      },
      {
        q: '¿Qué motivos aceptan para devolución?',
        a: 'Solo aceptamos devoluciones por producto defectuoso de fábrica (demostrable) o producto recibido incorrectamente (modelo, color o especificación diferente a la solicitada).',
      },
      {
        q: '¿Qué no está cubierto por la devolución?',
        a: 'No se aceptan devoluciones por cambio de opinión, desconocimiento del producto, daños por mal uso, software instalado o activado, empaque abierto sin defecto comprobable, ni reclamos después de las 24 horas.',
      },
      {
        q: '¿Los productos tienen garantía?',
        a: 'Sí. Todos los productos cuentan con garantía oficial del fabricante o importador. Ante fallas técnicas posteriores al plazo de devolución, se aplican las condiciones del fabricante.',
      },
    ],
  },
  {
    category: 'Productos y stock',
    items: [
      {
        q: '¿El stock que figura en el sitio es real?',
        a: 'Trabajamos para mantener el stock actualizado. Sin embargo, si un producto no está disponible al momento de confirmar el pedido, te contactamos de inmediato para ofrecerte alternativas.',
      },
      {
        q: '¿Puedo pedir un producto que no está en el sitio?',
        a: 'Sí. Tenemos acceso a un amplio catálogo de proveedores. Consultanos por WhatsApp indicando el producto que buscás y te cotizamos sin compromiso.',
      },
      {
        q: '¿Hacen precios especiales para empresas o compras en cantidad?',
        a: 'Sí, ofrecemos condiciones especiales para mayoristas, empresas y compras recurrentes. Contactanos directamente para acordar precios y condiciones.',
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b last:border-0" style={{ borderColor: 'var(--border)' }}>
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{q}</span>
        <ChevronDown
          size={16}
          style={{ color: 'var(--accent)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <p className="text-sm pb-4 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{a}</p>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Preguntas Frecuentes</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Todo lo que necesitás saber antes de comprar</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        {FAQS.map(({ category, items }) => (
          <div key={category} className="bg-white rounded-2xl px-7 py-5" style={{ border: '1.5px solid var(--border)' }}>
            <h2 className="text-base font-black mb-2" style={{ color: 'var(--accent)' }}>{category}</h2>
            {items.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        <div className="flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl text-center sm:text-left" style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-light)' }}>
          <MessageCircle size={28} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <div>
            <p className="font-black mb-1" style={{ color: 'var(--text-primary)' }}>¿No encontraste lo que buscabas?</p>
            <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>Nuestro equipo responde por WhatsApp en minutos.</p>
            <a
              href="https://wa.me/595971117959?text=Hola!%20Tengo%20una%20consulta."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: '#25d366' }}>
              Escribinos por WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
