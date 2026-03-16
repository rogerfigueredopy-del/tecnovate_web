import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
              Tecnovate
            </span>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              Tecnología de primera en Paraguay. Ciudad del Este, Alto Paraná.
            </p>
            <div className="flex gap-3 mt-4">
              {[
                { label: 'FB', href: '#' },
                { label: 'IG', href: '#' },
                { label: 'WA', href: '#' },
              ].map(s => (
                <a key={s.label} href={s.href} className="w-8 h-8 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center text-xs text-gray-400 hover:text-white transition-colors">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Productos</h4>
            <ul className="space-y-2.5">
              {['Notebooks', 'Componentes PC', 'Gaming', 'Celulares', 'Monitores'].map(c => (
                <li key={c}>
                  <Link href={`/products?category=${c.toLowerCase().replace(' ', '-')}`} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Ayuda</h4>
            <ul className="space-y-2.5">
              {[
                { label: 'Seguimiento de pedidos', href: '/track' },
                { label: 'Devoluciones', href: '/returns' },
                { label: 'Garantías', href: '/warranty' },
                { label: 'Preguntas frecuentes', href: '/faq' },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-500 hover:text-white transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-start gap-2">
                <span className="shrink-0">📍</span>
                <span>Ciudad del Este, Alto Paraná, Paraguay</span>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <a href="https://wa.me/595900000000" className="hover:text-green-400 transition-colors">+595 9XX XXX XXX</a>
              </li>
              <li className="flex items-center gap-2">
                <span>✉️</span>
                <a href="mailto:ventas@tecnovate.com.py" className="hover:text-cyan-400 transition-colors">ventas@tecnovate.com.py</a>
              </li>
              <li className="flex items-center gap-2">
                <span>🕐</span>
                <span>Lun–Sáb 8:00–18:00</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Tecnovate. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            {['Términos y condiciones', 'Política de privacidad'].map(l => (
              <Link key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                {l}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
