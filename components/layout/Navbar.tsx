'use client'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store/cart'
import { Search, ShoppingCart, User, ChevronDown, Menu, X, Heart, Package } from 'lucide-react'
import { ExchangeRateBadge } from '@/components/ui/ExchangeRateBadge'

const MENU = [
  {
    label: 'Informática',
    href: '/products?category=Notebooks',
    cols: [
      {
        title: 'Notebooks y PCs',
        items: [
          { label: 'Todos los Notebooks',       href: '/products?category=Notebooks' },
          { label: 'Notebooks Gaming',           href: '/products?category=Notebooks&q=gaming' },
          { label: 'Notebooks de Trabajo',       href: '/products?category=Notebooks&q=trabajo' },
          { label: 'MacBooks',                   href: '/products?category=Notebooks&q=macbook' },
          { label: 'Mini PC / Desktop',          href: '/products?category=Componentes&q=mini pc' },
        ]
      },
      {
        title: 'Componentes y Almacenamiento',
        items: [
          { label: 'Procesadores (CPU)',          href: '/products?category=Componentes&q=procesador' },
          { label: 'Tarjetas Gráficas',           href: '/products?category=Componentes&q=tarjeta grafica' },
          { label: 'Memorias RAM',                href: '/products?category=Componentes&q=memoria ram' },
          { label: 'SSD / Discos Duros',          href: '/products?category=Componentes&q=ssd' },
          { label: 'Pendrive / Memorias USB',     href: '/products?q=pendrive' },
          { label: 'Placas Madre',                href: '/products?category=Componentes&q=placa madre' },
          { label: 'Fuentes / Gabinetes',         href: '/products?category=Componentes&q=fuente' },
          { label: 'Ver todo Componentes',        href: '/products?category=Componentes' },
        ]
      },
      {
        title: 'Monitores e Impresoras',
        items: [
          { label: 'Todos los Monitores',         href: '/products?category=Monitores' },
          { label: 'Monitores 4K / OLED',         href: '/products?category=Monitores&q=4k' },
          { label: 'Monitores Gaming',            href: '/products?category=Monitores&q=gaming' },
          { label: 'Impresoras Inkjet / Láser',   href: '/products?category=Impresoras&q=impresora' },
          { label: 'Impresoras 3D',               href: '/products?category=Impresoras&q=filamento' },
          { label: 'Cartuchos y Tóner',           href: '/products?category=Impresoras&q=cartucho' },
        ]
      },
    ]
  },
  {
    label: 'Gaming',
    href: '/products?category=Gaming',
    cols: [
      {
        title: 'PC Gamer',
        items: [
          { label: '⚡ Armá tu PC',              href: '/gamer', highlight: true },
          { label: 'Tarjetas Gráficas RTX',      href: '/products?category=Componentes&q=rtx' },
          { label: 'Monitores Gaming',            href: '/products?category=Monitores&q=gaming' },
          { label: 'Gabinetes Gamer',             href: '/products?category=Gaming&q=gabinete' },
          { label: 'Sillas Gamer',               href: '/products?category=Gaming&q=silla' },
        ]
      },
      {
        title: 'Consolas y Juegos',
        items: [
          { label: 'Consolas',                    href: '/products?category=Gaming&q=consola' },
          { label: 'Juegos Nintendo Switch',      href: '/products?category=Gaming&q=juego' },
          { label: 'Controles',                   href: '/products?category=Gaming&q=control' },
          { label: 'Accesorios PS / Xbox',        href: '/products?category=Gaming&q=funda' },
          { label: 'Meta Quest VR',               href: '/products?category=Accesorios&q=quest' },
        ]
      },
      {
        title: 'Periféricos Gaming',
        items: [
          { label: 'Teclados Mecánicos',          href: '/products?category=Gaming&q=teclado' },
          { label: 'Mouses Gaming',               href: '/products?category=Gaming&q=ratón' },
          { label: 'Headsets',                    href: '/products?category=Gaming&q=headset' },
          { label: 'Mousepad',                    href: '/products?category=Gaming&q=mousepad' },
          { label: 'Ver todo Gaming',             href: '/products?category=Gaming' },
        ]
      },
    ]
  },
  {
    label: 'Celulares',
    href: '/products?category=Celulares',
    cols: [
      {
        title: 'Smartphones',
        items: [
          { label: 'Todos los Celulares',         href: '/products?category=Celulares' },
          { label: 'iPhones',                     href: '/products?category=Celulares&q=iphone' },
          { label: 'Samsung Galaxy',              href: '/products?category=Celulares&q=samsung' },
          { label: 'Xiaomi',                      href: '/products?category=Celulares&q=xiaomi' },
          { label: 'Motorola',                    href: '/products?category=Celulares&q=motorola' },
        ]
      },
      {
        title: 'Tablets y Wearables',
        items: [
          { label: 'Tablets',                     href: '/products?category=Celulares&q=tablet' },
          { label: 'Smartwatches',                href: '/products?category=Celulares&q=smartwatch' },
          { label: 'Apple Watch / Garmin',        href: '/products?category=Accesorios&q=garmin' },
          { label: 'Auriculares TWS',             href: '/products?category=Celulares&q=auricular' },
          { label: 'Cargadores',                  href: '/products?category=Celulares&q=cargador' },
        ]
      },
    ]
  },
  {
    label: 'Televisores',
    href: '/products?category=Networking&q=smart tv',
    cols: [
      {
        title: 'Smart TV',
        items: [
          { label: 'Todos los Televisores',       href: '/products?category=Networking&q=smart tv' },
          { label: 'Smart TV 32"',                href: '/products?category=Networking&q=32' },
          { label: 'Smart TV 43"',                href: '/products?category=Networking&q=43' },
          { label: 'Smart TV 55"',                href: '/products?category=Networking&q=55' },
          { label: 'Smart TV 65" o más',          href: '/products?category=Networking&q=65' },
        ]
      },
      {
        title: 'Por marca',
        items: [
          { label: 'Samsung',                     href: '/products?category=Networking&q=samsung tv' },
          { label: 'Hisense',                     href: '/products?category=Networking&q=hisense' },
          { label: 'LG',                          href: '/products?category=Networking&q=lg tv' },
          { label: 'TCL',                         href: '/products?category=Networking&q=tcl' },
          { label: 'Aiwa / Mtek',                 href: '/products?category=Networking&q=aiwa' },
        ]
      },
    ]
  },
  {
    label: 'Networking',
    href: '/products?category=Networking',
    cols: [
      {
        title: 'Conectividad',
        items: [
          { label: 'Todos los Productos',         href: '/products?category=Networking' },
          { label: 'Routers WiFi',                href: '/products?category=Networking&q=router' },
          { label: 'Switches y Hubs',             href: '/products?category=Networking&q=switch' },
          { label: 'Adaptadores WiFi / USB',      href: '/products?category=Networking&q=adaptador' },
        ]
      },
      {
        title: 'Seguridad y Smart Home',
        items: [
          { label: 'Cámaras IP / CCTV',           href: '/products?category=Networking&q=cámara' },
          { label: 'Smart Home',                  href: '/products?category=Networking&q=smart home' },
          { label: 'NVR / DVR',                   href: '/products?category=Networking&q=nvr' },
          { label: 'Ver todo Networking',         href: '/products?category=Networking' },
        ]
      },
    ]
  },
  {
    label: 'Accesorios',
    href: '/products?category=Accesorios',
    cols: [
      {
        title: 'Perfumes y Fragancias',
        items: [
          { label: 'Todos los Perfumes',          href: '/products?q=perfume' },
          { label: 'Lattafa',                     href: '/products?q=lattafa' },
          { label: 'Maison Alhambra',             href: '/products?q=maison' },
          { label: 'Armaf',                       href: '/products?q=armaf' },
          { label: "Victoria's Secret",           href: '/products?q=victoria' },
          { label: 'Lancôme / Yves Saint Laurent',href: '/products?q=lancome' },
        ]
      },
      {
        title: 'Audio y Multimedia',
        items: [
          { label: 'Auriculares',                 href: '/products?category=Accesorios&q=auricular' },
          { label: 'Cámaras Digitales',           href: '/products?category=Accesorios&q=cámara' },
          { label: 'Drones',                      href: '/products?category=Accesorios&q=drone' },
          { label: 'Meta Quest VR',               href: '/products?category=Accesorios&q=quest' },
        ]
      },
      {
        title: 'Otros',
        items: [
          { label: 'Smartwatches / Garmin',       href: '/products?category=Accesorios&q=garmin' },
          { label: 'Fundas y Protectores',        href: '/products?category=Accesorios&q=funda' },
          { label: 'Cargadores Portátiles',       href: '/products?category=Accesorios&q=cargador' },
          { label: 'Ver todo Accesorios',         href: '/products?category=Accesorios' },
        ]
      },
    ]
  },
  {
    label: 'Nosotros',
    href: '/about',
    cols: [
      {
        title: 'La empresa',
        items: [
          { label: 'Quiénes somos',            href: '/about' },
          { label: 'Contacto',                 href: '/contact' },
          { label: 'Trabaja con nosotros',     href: '/careers' },
        ]
      },
      {
        title: 'Información',
        items: [
          { label: 'Envíos y Devoluciones',    href: '/shipping' },
          { label: 'Métodos de pago',          href: '/payments' },
          { label: 'Preguntas frecuentes',     href: '/faq' },
          { label: 'Términos y Condiciones',   href: '/terms' },
        ]
      },
    ]
  },
]

export function Navbar() {
  const { data: session } = useSession()
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))
  const [search, setSearch] = useState('')
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) {
      router.push(`/products?q=${encodeURIComponent(search)}`)
      setSearch('')
    }
  }

  return (
    <>
      {/* Top bar */}
<div style={{ background: 'var(--accent)', color: 'white' }} className="text-xs py-1.5">
  <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <span className="hidden sm:inline">Envíos a todo Paraguay </span>
      <ExchangeRateBadge />
    </div>
    <div className="flex gap-4">
      <Link href="/track"   className="hover:underline opacity-90">Rastrear pedido</Link>
      <Link href="/about"   className="hover:underline opacity-90">Nosotros</Link>
      <Link href="/contact" className="hover:underline opacity-90">Contacto</Link>
      <Link href="/faq"     className="hover:underline opacity-90">Preguntas frecuentes</Link>
    </div>
  </div>
</div>

      {/* Main navbar */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 h-16">
            {/* Logo */}
            <Link href="/" className="shrink-0 flex items-center gap-2">
              <span className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Tecnovate</span>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
              <div className="flex border-2 rounded-lg overflow-hidden" style={{ borderColor: 'var(--accent)' }}>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="¿Qué producto buscás?"
                  className="flex-1 px-4 py-2.5 text-sm outline-none bg-white"
                  style={{ color: 'var(--text-primary)' }}
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 text-white font-semibold text-sm flex items-center gap-2"
                  style={{ background: 'var(--accent)' }}
                >
                  <Search size={16} />
                  Buscar
                </button>
              </div>
            </form>

            {/* Right icons */}
            <div className="flex items-center gap-1 shrink-0">
              {/* Wishlist */}
              <Link href="/wishlist" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                <Heart size={20} style={{ color: 'var(--text-secondary)' }} className="group-hover:text-accent" />
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Favoritos</span>
              </Link>

              {/* Orders */}
              <Link href="/orders" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors group">
                <Package size={20} style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Pedidos</span>
              </Link>

              {/* Cart */}
              <Link href="/cart" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors relative">
                <div className="relative">
                  <ShoppingCart size={20} style={{ color: 'var(--text-secondary)' }} />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold" style={{ background: 'var(--accent)', fontSize: '10px' }}>
                      {cartCount > 9 ? '9+' : cartCount}
                    </span>
                  )}
                </div>
                <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Carrito</span>
              </Link>

              {/* Auth */}
              {session ? (
                <div className="relative group">
                  <button className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: 'var(--accent)' }}>
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Mi cuenta</span>
                  </button>
                  <div className="absolute right-0 top-12 w-52 bg-white border rounded-xl shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50" style={{ borderColor: 'var(--border)' }}>
                    <div className="p-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="font-semibold text-sm truncate">{session.user?.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{session.user?.email}</p>
                    </div>
                    <div className="p-2">
                      {(session.user as any)?.role === 'ADMIN' && (
                        <Link href="/admin" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50 font-semibold" style={{ color: 'var(--accent)' }}>
                          Panel Admin
                        </Link>
                      )}
                      <Link href="/profile" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50" style={{ color: 'var(--text-primary)' }}>Mi perfil</Link>
                      <Link href="/orders" className="block px-3 py-2 text-sm rounded-lg hover:bg-gray-50" style={{ color: 'var(--text-primary)' }}>Mis pedidos</Link>
                      <button onClick={() => signOut()} className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-red-50 text-red-500">
                        Cerrar sesión
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link href="/login" className="flex flex-col items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <User size={20} style={{ color: 'var(--text-secondary)' }} />
                  <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>Ingresar</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Category nav bar */}
        <div className="hidden lg:block border-t" style={{ borderColor: 'var(--border)', background: 'white' }} ref={menuRef}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-1">
{MENU.map(item => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => setOpenMenu(item.label)}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Link
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-3 text-sm font-600 transition-colors hover:text-accent"
                    style={{
                      color: openMenu === item.label ? 'var(--accent)' : 'var(--text-primary)',
                      fontWeight: 600,
                      borderBottom: openMenu === item.label ? '2px solid var(--accent)' : '2px solid transparent',
                    }}
                  >
                    {item.label}
                    <ChevronDown size={13} />
                  </Link>

                  {/* Mega menu dropdown */}
                  {openMenu === item.label && item.cols && (
                    <div
                      className="absolute top-full left-0 bg-white border rounded-b-xl shadow-xl z-50 p-5"
                      style={{ borderColor: 'var(--border)', minWidth: `${item.cols.length * 200}px`, borderTop: '2px solid var(--accent)' }}
                    >
                      <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${item.cols.length}, 1fr)` }}>
                        {item.cols.map(col => (
                          <div key={col.title}>
                            <p className="font-800 text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--accent)', fontWeight: 800 }}>
                              {col.title}
                            </p>
                            <ul className="space-y-1.5">
                              {col.items.map(link => (
                                <li key={link.label}>
                                  <Link
                                    href={link.href}
                                    className="text-sm block py-1 px-2 rounded-lg transition-colors hover:bg-gray-50"
                                    style={{
                                      color: (link as any).highlight ? 'var(--accent)' : 'var(--text-secondary)',
                                      fontWeight: (link as any).highlight ? 700 : 400,
                                    }}
                                    onClick={() => setOpenMenu(null)}
                                  >
                                    {link.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Armar PC highlight */}
              <Link
                href="/gamer"
                className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
              >
                ⚡ Armá tu PC
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-40 overflow-y-auto pt-4 px-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-xl font-black" style={{ color: 'var(--accent)' }}>Menú</span>
            <button onClick={() => setMobileOpen(false)}><X size={24} /></button>
          </div>
          {MENU.map(item => (
            <div key={item.label} className="border-b py-3" style={{ borderColor: 'var(--border)' }}>
              <Link href={item.href} className="font-bold text-base block" style={{ color: 'var(--text-primary)' }} onClick={() => setMobileOpen(false)}>
                {item.label}
              </Link>
            </div>
          ))}
          <div className="border-b py-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-black uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Información</p>
            {[
              { label: 'Envíos y Devoluciones', href: '/shipping' },
              { label: 'Métodos de pago',       href: '/payments' },
              { label: 'Preguntas frecuentes',  href: '/faq' },
              { label: 'Términos y Condiciones',href: '/terms' },
              { label: 'Trabaja con nosotros',  href: '/careers' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="block text-sm py-1" style={{ color: 'var(--text-secondary)' }} onClick={() => setMobileOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
          <div className="pt-4">
            <Link href="/gamer" className="block text-center py-3 rounded-xl text-white font-bold" style={{ background: 'var(--accent)' }} onClick={() => setMobileOpen(false)}>
              ⚡ Armá tu PC
            </Link>
          </div>
        </div>
      )}
    </>
  )
}
