import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: 'var(--text-primary)', color: 'rgba(255,255,255,0.8)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-black block mb-3" style={{ color: 'var(--accent-light)' }}>Tecnovate</span>
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
              Tecnología de primera en Paraguay. Ciudad del Este, Alto Paraná.
            </p>
            <div className="flex gap-2">
              {['FB', 'IG', 'TW', 'WA'].map(s => (
                <a key={s} href="#" className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-colors" style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'var(--accent)'; (e.currentTarget as HTMLAnchorElement).style.color = 'white' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.08)'; (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)' }}>
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-800 mb-4 text-white" style={{ fontWeight: 800 }}>Productos</h4>
            <ul className="space-y-2">
              {['Notebooks', 'Componentes PC', 'Gaming', 'Celulares', 'Monitores', 'Accesorios'].map(c => (
                <li key={c}>
                  <Link href={`/products?category=${c}`} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}>
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PC Builder */}
          <div>
            <h4 className="text-sm font-800 mb-4 text-white" style={{ fontWeight: 800 }}>Zona Gamer</h4>
            <ul className="space-y-2">
              {[
                { label: 'Armá tu PC', href: '/gamer' },
                { label: 'Notebooks Gaming', href: '/products?category=Gaming' },
                { label: 'Tarjetas Gráficas', href: '/products?q=rtx' },
                { label: 'Procesadores', href: '/products?q=procesador' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-800 mb-4 text-white" style={{ fontWeight: 800 }}>Ayuda</h4>
            <ul className="space-y-2">
              {[
                { label: 'Rastrear pedido', href: '/track' },
                { label: 'Devoluciones', href: '/returns' },
                { label: 'Garantías', href: '/warranty' },
                { label: 'Preguntas frecuentes', href: '/faq' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent-light)'}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.5)'}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-800 mb-4 text-white" style={{ fontWeight: 800 }}>Contacto</h4>
            <ul className="space-y-3">
              {[
                { icon: '📍', text: 'Ciudad del Este, Alto Paraná' },
                { icon: '📱', text: '+595 9XX XXX XXX' },
                { icon: '✉️', text: 'ventas@tecnovate.com.py' },
                { icon: '🕐', text: 'Lun–Sáb 8:00–18:00' },
              ].map(i => (
                <li key={i.text} className="flex items-start gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  <span>{i.icon}</span>
                  <span>{i.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Payments */}
        <div className="border-t py-6 mb-6" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs mb-3 text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>Métodos de pago aceptados</p>
          <div className="flex justify-center gap-3 flex-wrap">
            {['💳 Bancard', '🌐 PayPal', '📱 Tigo Money', '💵 Efectivo'].map(m => (
              <span key={m} className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)' }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            © {new Date().getFullYear()} Tecnovate. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {['Términos y condiciones', 'Política de privacidad'].map(l => (
              <Link key={l} href="#" className="text-xs transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.3)'}>
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
