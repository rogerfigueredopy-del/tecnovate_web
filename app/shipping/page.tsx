import { Truck, RotateCcw, Clock, MapPin, AlertTriangle, CheckCircle, XCircle, Package } from 'lucide-react'

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-7" style={{ border: '1.5px solid var(--border)' }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-bg)' }}>
          <Icon size={20} style={{ color: 'var(--accent)' }} />
        </div>
        <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  )
}

export default function ShippingPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Envíos y Devoluciones</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Todo lo que necesitás saber sobre entregas y cambios</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        <Section icon={Truck} title="Política de envío">
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p><strong style={{ color: 'var(--text-primary)' }}>Ámbito:</strong> Realizamos envíos a todo Paraguay mediante servicios de paquetería certificados.</p>

            <div>
              <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Tiempos de entrega estimados:</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { zone: 'Asunción y Gran Asunción', time: '24 horas hábiles' },
                  { zone: 'Interior del país',        time: '2 a 5 días hábiles' },
                ].map(z => (
                  <div key={z.zone} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
                    <Clock size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                    <div>
                      <p className="font-bold text-xs" style={{ color: 'var(--accent)' }}>{z.zone}</p>
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{z.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>Los tiempos pueden variar por causas ajenas a la empresa: clima, logística externa, feriados, etc.</p>
            </div>

            <div className="p-4 rounded-xl" style={{ background: '#fefce8', border: '1px solid #fde047' }}>
              <p className="font-bold text-sm mb-1" style={{ color: '#854d0e' }}>💳 Pago anticipado requerido</p>
              <p className="text-sm" style={{ color: '#713f12' }}>
                Se requiere el <strong>50% del total de la compra</strong> previo al despacho del pedido.
                El saldo restante puede abonarse contra entrega en Asunción o antes del envío al interior.
              </p>
            </div>

            <div>
              <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Costos de envío:</p>
              <ul className="space-y-1 list-none">
                {[
                  'El valor del envío será informado antes de finalizar la compra.',
                  'El cliente es responsable de verificar sus datos de entrega.',
                  'Si el paquete vuelve por dirección incorrecta o ausencia, el cliente deberá abonar un nuevo envío.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              <Package size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <p><strong style={{ color: 'var(--accent)' }}>Entrega segura:</strong> Todos los productos viajan asegurados. En caso de daño durante el transporte, deberá notificarse <strong>dentro de las 24 horas</strong> de recibido el paquete.</p>
            </div>
          </div>
        </Section>

        <Section icon={RotateCcw} title="Política de cambios y devoluciones">
          <div className="space-y-5 text-sm" style={{ color: 'var(--text-secondary)' }}>

            <div className="p-4 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              <p className="font-bold mb-1" style={{ color: 'var(--accent)' }}>Plazo para devoluciones</p>
              <p>Se aceptan devoluciones o cambios <strong>únicamente dentro de las 24 horas corridas</strong> posteriores a la recepción comprobada del producto.</p>
            </div>

            <div>
              <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Condiciones obligatorias del producto:</p>
              <ul className="space-y-1.5">
                {[
                  'Perfecto estado, sin uso ni señales de uso.',
                  'Empaque original cerrado e intacto.',
                  'Todos los accesorios, manuales y cables incluidos.',
                  'Factura o comprobante de compra.',
                  'Sin software instalado, activado o registrado.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Motivos aceptados:</p>
              <ul className="space-y-1.5">
                {[
                  'Producto defectuoso de fábrica (debe ser comprobable y documentado).',
                  'Producto recibido incorrectamente (modelo, color o especificación distinta a la solicitada).',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle size={14} style={{ color: '#16a34a', marginTop: 2, flexShrink: 0 }} />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }}>
              <p className="font-bold mb-2" style={{ color: '#dc2626' }}>No se aceptan devoluciones por:</p>
              <ul className="space-y-1.5">
                {[
                  'Cambio de opinión, arrepentimiento o error de compra del cliente.',
                  'Desconocimiento del producto o de sus características técnicas (consultá antes de comprar).',
                  'Daños causados por mal uso, caídas, líquidos, manipulación o instalación incorrecta.',
                  'Productos con empaque abierto sin defecto de fábrica comprobable.',
                  'Software instalado, activado, registrado o con cuenta vinculada.',
                  'Productos usados, con rayones, suciedad o marcas de uso.',
                  'Accesorios o partes faltantes al momento del reclamo.',
                  'Reclamos realizados después de las 24 horas de recibido el pedido.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <XCircle size={14} style={{ color: '#dc2626', marginTop: 2, flexShrink: 0 }} />
                    <span className="text-sm" style={{ color: '#7f1d1d' }}>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Procedimiento para solicitar cambio o devolución:</p>
              <ol className="space-y-2">
                {[
                  'Contactar al equipo de postventa por WhatsApp (+595 971 117959) dentro de las 24 horas de recibido el pedido.',
                  'Indicar número de factura, descripción del problema y fotos o video del defecto.',
                  'Aguardar confirmación y coordinación del retiro o envío.',
                  'El cliente es responsable del costo de devolución, salvo error de nuestra parte.',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>{i + 1}</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="flex items-start gap-3 p-4 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              <AlertTriangle size={18} style={{ color: 'var(--accent)', flexShrink: 0, marginTop: 2 }} />
              <p><strong style={{ color: 'var(--accent)' }}>Garantía:</strong> Los productos cuentan con garantía oficial del fabricante o importador. Ante fallas técnicas posteriores al plazo de devolución, se aplicarán las condiciones de garantía del fabricante.</p>
            </div>
          </div>
        </Section>

      </div>
    </div>
  )
}
