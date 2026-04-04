import { FileText, ShieldCheck, Lock, Users, AlertCircle, Scale } from 'lucide-react'

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

export default function TermsPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Términos y Condiciones</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Última actualización: abril 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        <Section icon={FileText} title="Aceptación de los términos">
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Al acceder y realizar compras en <strong style={{ color: 'var(--text-primary)' }}>Tecnovate</strong>, el usuario acepta de forma expresa los presentes
            Términos y Condiciones, así como la Política de Privacidad y las demás políticas publicadas en el sitio.
            Si no estás de acuerdo con alguno de estos términos, te pedimos que no utilices nuestros servicios.
          </p>
        </Section>

        <Section icon={ShieldCheck} title="Sobre Tecnovate">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Tecnovate es una empresa paraguaya con sede en <strong style={{ color: 'var(--text-primary)' }}>Asunción, Paraguay</strong>, dedicada a la comercialización de productos tecnológicos, electrónicos y artículos de consumo.</p>
            <p>Número de contacto: <strong style={{ color: 'var(--text-primary)' }}>+595 971 117 959</strong></p>
            <p>Email: <strong style={{ color: 'var(--text-primary)' }}>tecnovate.py@gmail.com</strong></p>
          </div>
        </Section>

        <Section icon={Scale} title="Condiciones de compra">
          <div className="space-y-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Al realizar una compra, el cliente declara:</p>
            <ul className="space-y-2 list-none">
              {[
                'Ser mayor de edad o contar con autorización de un adulto responsable.',
                'Que los datos personales y de entrega proporcionados son correctos y verídicos.',
                'Haber leído y comprendido las políticas de envío, devolución y métodos de pago antes de finalizar el pedido.',
                'Que el 50% del valor total debe ser abonado antes del despacho del pedido.',
                'Que los precios publicados están en Guaraníes paraguayos (₲) y pueden variar sin previo aviso en función del tipo de cambio.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>{i + 1}</span>
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section icon={Lock} title="Privacidad y protección de datos">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Tecnovate recopila únicamente los datos necesarios para procesar pedidos y brindar atención al cliente: nombre, teléfono, dirección de entrega y correo electrónico.</p>
            <p>Estos datos <strong style={{ color: 'var(--text-primary)' }}>no son compartidos, vendidos ni cedidos</strong> a terceros, salvo cuando sea necesario para la logística de entrega (empresas de transporte).</p>
            <p>El usuario puede solicitar la eliminación de sus datos personales escribiendo a nuestro correo.</p>
            <p><strong style={{ color: 'var(--text-primary)' }}>Seguridad de pagos:</strong> No almacenamos datos de tarjetas de crédito. Todas las transacciones son procesadas en entornos seguros y encriptados.</p>
          </div>
        </Section>

        <Section icon={AlertCircle} title="Limitación de responsabilidad">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Tecnovate no se hace responsable por:</p>
            <ul className="space-y-1.5 mt-2">
              {[
                'Demoras en la entrega causadas por factores externos: clima, logística de transporte, feriados nacionales.',
                'Daños causados por uso inadecuado del producto.',
                'Incompatibilidad de productos por desconocimiento técnico del cliente (consultá antes de comprar).',
                'Interrupciones del servicio del sitio web por mantenimiento o causas de fuerza mayor.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section icon={Users} title="Compras mayoristas">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Para compras al por mayor, Tecnovate ofrece precios especiales, stock reservado y condiciones de pago diferenciadas, sujetas a acuerdo previo.</p>
            <p>Las condiciones mayoristas se formalizan mediante comunicación directa con nuestro equipo y no aplican automáticamente en el sitio web.</p>
            <a href="https://wa.me/595971117959?text=Hola!%20Quiero%20consultar%20precios%20mayoristas."
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white mt-2"
              style={{ background: '#25d366' }}>
              Consultar condiciones mayoristas
            </a>
          </div>
        </Section>

        <div className="p-5 rounded-2xl text-center text-sm" style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-light)', color: 'var(--text-secondary)' }}>
          Tecnovate se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
          Los cambios serán publicados en esta página con la fecha de actualización correspondiente.
        </div>

      </div>
    </div>
  )
}
