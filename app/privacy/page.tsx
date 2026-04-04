import { Lock, Eye, Database, UserCheck, Mail, ShieldCheck, Trash2 } from 'lucide-react'

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

export default function PrivacyPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Política de Privacidad</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Última actualización: abril 2025</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">

        <Section icon={Eye} title="¿Qué información recopilamos?">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Al registrarte o realizar una compra en Tecnovate recopilamos únicamente la información necesaria para brindar nuestros servicios:</p>
            <ul className="space-y-2 mt-3">
              {[
                { label: 'Datos de identificación', desc: 'Nombre completo, número de teléfono y dirección de correo electrónico.' },
                { label: 'Datos de entrega', desc: 'Dirección postal para coordinar el envío de tus pedidos.' },
                { label: 'Datos de navegación', desc: 'Páginas visitadas, productos vistos y búsquedas realizadas (para mejorar tu experiencia).' },
                { label: 'Datos de cuenta social', desc: 'Si iniciás sesión con Google u Outlook, recibimos únicamente tu nombre, email y foto de perfil autorizados por vos.' },
              ].map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'var(--bg-secondary)' }}>
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: 'var(--accent)' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section icon={Database} title="¿Cómo usamos tu información?">
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p className="mb-3">Utilizamos tus datos exclusivamente para:</p>
            {[
              'Procesar y gestionar tus pedidos y pagos.',
              'Coordinar la entrega de productos a tu domicilio.',
              'Enviarte confirmaciones, actualizaciones y novedades de tu compra.',
              'Brindarte soporte postventa y atención al cliente.',
              'Mejorar tu experiencia de navegación y las recomendaciones de productos.',
              'Cumplir con obligaciones legales y fiscales aplicables en Paraguay.',
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-2 py-1.5">
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5" style={{ background: 'var(--accent)' }}>{i + 1}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Section>

        <Section icon={Lock} title="¿Compartimos tus datos?">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <div className="p-4 rounded-xl" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-light)' }}>
              <p className="font-black mb-1" style={{ color: 'var(--accent)' }}>No vendemos ni cedemos tus datos.</p>
              <p>Tecnovate nunca vende, alquila ni cede tu información personal a terceros con fines comerciales.</p>
            </div>
            <p>Solo compartimos datos estrictamente necesarios con:</p>
            <ul className="space-y-1.5 mt-2">
              {[
                'Empresas de logística y transporte para coordinar la entrega de tus pedidos.',
                'Proveedores de pago (procesadores de tarjetas, billeteras digitales) únicamente para completar transacciones.',
                'Autoridades competentes cuando así lo exija la ley paraguaya.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section icon={ShieldCheck} title="Seguridad de tus datos">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Implementamos medidas técnicas y organizativas para proteger tu información:</p>
            <div className="grid sm:grid-cols-2 gap-3 mt-3">
              {[
                { title: 'Cifrado SSL/TLS', desc: 'Toda la comunicación entre tu dispositivo y nuestros servidores viaja cifrada.' },
                { title: 'Sin almacenamiento de tarjetas', desc: 'No guardamos datos de tarjetas de crédito o débito en nuestros servidores.' },
                { title: 'Acceso restringido', desc: 'Solo personal autorizado de Tecnovate puede acceder a tus datos.' },
                { title: 'Autenticación segura', desc: 'Las contraseñas se almacenan con hash bcrypt, nunca en texto plano.' },
              ].map(({ title, desc }) => (
                <div key={title} className="p-3 rounded-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  <p className="font-black text-xs mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                  <p className="text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={UserCheck} title="Tus derechos">
          <div className="space-y-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Como usuario de Tecnovate, tenés derecho a:</p>
            <ul className="space-y-2 mt-2">
              {[
                { label: 'Acceso', desc: 'Solicitar qué datos tuyos tenemos almacenados.' },
                { label: 'Rectificación', desc: 'Corregir datos incorrectos o desactualizados.' },
                { label: 'Eliminación', desc: 'Pedir que eliminemos tu cuenta y datos personales.' },
                { label: 'Portabilidad', desc: 'Recibir una copia de tus datos en formato legible.' },
                { label: 'Oposición', desc: 'Oponerte al uso de tus datos para comunicaciones comerciales.' },
              ].map(({ label, desc }) => (
                <li key={label} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                  <span><strong style={{ color: 'var(--text-primary)' }}>{label}:</strong> {desc}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        <Section icon={Trash2} title="Retención y eliminación de datos">
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Conservamos tus datos mientras tu cuenta esté activa o mientras sea necesario para cumplir con obligaciones legales.</p>
            <p>Podés solicitar la eliminación de tu cuenta y datos personales en cualquier momento escribiendo a <strong style={{ color: 'var(--text-primary)' }}>tecnovate.py@gmail.com</strong>. Procesamos estas solicitudes en un plazo máximo de 10 días hábiles.</p>
          </div>
        </Section>

        <Section icon={Mail} title="Cookies y tecnologías similares">
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            <p>Utilizamos cookies propias para:</p>
            <ul className="space-y-1.5 mt-2">
              {[
                'Mantener tu sesión iniciada mientras navegás.',
                'Recordar el contenido de tu carrito de compras.',
                'Analizar el tráfico del sitio de forma anónima para mejorar el rendimiento.',
              ].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--accent)' }} />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2">No utilizamos cookies de seguimiento de terceros con fines publicitarios.</p>
          </div>
        </Section>

        <div className="p-5 rounded-2xl text-sm text-center" style={{ background: 'var(--accent-bg)', border: '1.5px solid var(--accent-light)', color: 'var(--text-secondary)' }}>
          ¿Tenés preguntas sobre esta política? Escribinos a{' '}
          <a href="mailto:tecnovate.py@gmail.com" className="font-bold" style={{ color: 'var(--accent)' }}>tecnovate.py@gmail.com</a>
          {' '}o por{' '}
          <a href="https://wa.me/595971117959" target="_blank" rel="noopener noreferrer" className="font-bold" style={{ color: 'var(--accent)' }}>WhatsApp</a>.
        </div>

      </div>
    </div>
  )
}
