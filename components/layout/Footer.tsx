'use client'
import Link from 'next/link'

export function Footer() {
  return (
    <footer style={{ background: '#1a1a2e', color: 'rgba(255,255,255,0.7)' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Tecnovate" className="block mb-3" style={{ height: 72, width: 'auto', objectFit: 'contain' }} />
            <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
              Tecnología de primera en Paraguay. Asunción, Paraguay.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white">Productos</h4>
            <ul className="space-y-2">
              {['Notebooks','Componentes PC','Gaming','Celulares','Monitores','Accesorios'].map(c => (
                <li key={c}><Link href={`/products?category=${c}`} className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>{c}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white">Zona Gamer</h4>
            <ul className="space-y-2">
              <li><Link href="/gamer" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Armá tu PC</Link></li>
              <li><Link href="/products?category=Gaming" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Notebooks Gaming</Link></li>
              <li><Link href="/products?q=rtx" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Tarjetas Gráficas</Link></li>
              <li><Link href="/products?q=procesador" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Procesadores</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white">Ayuda</h4>
            <ul className="space-y-2">
              <li><Link href="/orders" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Mis pedidos</Link></li>
              <li><Link href="/profile" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Mi cuenta</Link></li>
              <li><Link href="/contact" className="text-sm hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold mb-4 text-white">Contacto</h4>
            <ul className="space-y-3 text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              <li>📍 Asunción, Paraguay</li>
              <li>📱 +595 971 117 959</li>
              <li>✉️ tecnovate.py@gmail.com</li>
              <li>🕐 Lun–Vie 8:00–18:00 / Sáb 9:00–13:00</li>
            </ul>
          </div>
        </div>
        <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>© {new Date().getFullYear()} Tecnovate. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            <Link href="#" className="text-xs hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Términos y condiciones</Link>
            <Link href="#" className="text-xs hover:text-white transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>Política de privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}