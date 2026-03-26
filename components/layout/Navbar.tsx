// Al inicio del archivo, agregá:
import { ExchangeRateBadge } from '@/components/ui/ExchangeRateBadge'

// El top bar queda así:
{/* Top bar */}
<div style={{ background: 'var(--accent)', color: 'white' }} className="text-xs py-1.5">
  <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline">Envíos a todo Paraguay | Ciudad del Este</span>
      <ExchangeRateBadge />
    </div>
    <div className="flex gap-4">
      <Link href="/track"   className="hover:underline opacity-90">Rastrear pedido</Link>
      <Link href="/about"   className="hover:underline opacity-90">Nosotros</Link>
      <Link href="/contact" className="hover:underline opacity-90">Contacto</Link>
    </div>
  </div>
</div>