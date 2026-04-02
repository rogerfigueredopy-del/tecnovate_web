'use client'
import { ExchangeRateBar } from '@/components/ui/ExchangeRate'
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
          { label: 'Todos los Notebooks',   href: '/products?category=Notebooks' },
          { label: 'Notebooks Gaming',       href: '/products?category=Notebooks&q=gaming' },
          { label: 'Notebooks de Trabajo',   href: '/products?category=Notebooks&q=trabajo' },
          { label: 'MacBooks',               href: '/products?category=Notebooks&q=macbook' },
          { label: 'Mini PC / Desktop',      href: '/products?category=Componentes&q=mini pc' },
        ]
      },
      {
        title: 'Componentes PC',
        items: [
          { label: 'Procesadores (CPU)',      href: '/products?category=Componentes&q=procesador' },
          { label: 'Placas Madre',            href: '/products?category=Componentes&q=placa madre' },
          { label: 'Tarjetas Gráficas',       href: '/products?category=Componentes&q=tarjeta grafica' },
          { label: 'Memorias RAM',            href: '/products?category=Componentes&q=memoria ram' },
          { label: 'SSD / Almacenamiento',    href: '/products?category=Componentes&q=ssd' },
          { label: 'Fuentes de Poder',        href: '/products?category=Componentes&q=fuente' },
          { label: 'Gabinetes',               href: '/products?category=Componentes&q=gabinete' },
          { label: 'Coolers / Watercooling',  href: '/products?category=Componentes&q=cooler' },
        ]
      },
      {
        title: 'Monitores y Periféricos',
        items: [
          { label: 'Todos los Monitores',     href: '/products?category=Monitores' },
          { label: 'Monitores 4K',            href: '/products?category=Monitores&q=4k' },
          { label: 'Monitores Gaming',        href: '/products?category=Monitores&q=gaming' },
          { label: 'Teclados y Mouses',       href: '/products?category=Gaming&q=teclado' },
          { label: 'Auriculares',             href: '/products?category=Gaming&q=auricular' },
          { label: 'Networking / Routers',    href: '/products?category=Networking' },
          { label: 'Impresoras',              href: '/products?category=Impresoras&q=impresora' },
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
          { label: '⚡ Armá tu PC',          href: '/gamer', highlight: true },
          { label: 'Tarjetas Gráficas RTX',  href: '/products?category=Componentes&q=rtx' },
          { label: 'Monitores Gaming',        href: '/products?category=Monitores&q=gaming' },
          { label: 'Gabinetes Gamer',         href: '/products?category=Gaming&q=gabinete' },
          { label: 'Sillas Gamer',            href: '/products?category=Gaming&q=silla' },
        ]
      },
      {
        title: 'Consolas y Juegos',
        items: [
          { label: 'Consolas',                href: '/products?category=Gaming&q=consola' },
          { label: 'Juegos Nintendo Switch',  href: '/products?category=Gaming&q=juego' },
          { label: 'Controles',               href: '/products?category=Gaming&q=control' },
          { label: 'Accesorios PS / Xbox',    href: '/products?category=Gaming&q=funda' },
        ]
      },
      {
        title: 'Accesorios Gaming',
        items: [
          { label: 'Teclados Mecánicos',      href: '/products?category=Gaming&q=teclado' },
          { label: 'Mouses Gaming',           href: '/products?category=Gaming&q=ratón' },
          { label: 'Headsets',                href: '/products?category=Gaming&q=headset' },
          { label: 'Mousepad',                href: '/products?category=Gaming&q=mousepad' },
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
          { label: 'Todos los Celulares',     href: '/products?category=Celulares' },
          { label: 'iPhones',                 href: '/products?category=Celulares&q=iphone' },
          { label: 'Samsung Galaxy',          href: '/products?category=Celulares&q=samsung' },
          { label: 'Xiaomi',                  href: '/products?category=Celulares&q=xiaomi' },
          { label: 'Motorola',                href: '/products?category=Celulares&q=motorola' },
        ]
      },
      {
        title: 'Tablets y Wearables',
        items: [
          { label: 'Tablets',                 href: '/products?category=Celulares&q=tablet' },
          { label: 'Smartwatches',            href: '/products?category=Celulares&q=smartwatch' },
          { label: 'Apple Watch / Garmin',    href: '/products?category=Accesorios&q=garmin' },
          { label: 'Auriculares TWS',         href: '/products?category=Celulares&q=auricular' },
          { label: 'Cargadores',              href: '/products?category=Celulares&q=cargador' },
        ]
      },
    ]
  },
  {
    label: 'Accesorios',
    href: '/products?category=Accesorios',
    cols: [
      {
        title: 'Perfumes y Belleza',
        items: [
          { label: 'Perfumes',                href: '/products?category=Accesorios&q=perfume' },
          { label: 'Lattafa',                 href: '/products?category=Accesorios&q=lattafa' },
          { label: 'Maison',                  href: '/products?category=Accesorios&q=maison' },
          { label: 'Armaf',                   href: '/products?category=Accesorios&q=armaf' },
          { label: "Victoria's Secret",       href: '/products?category=Accesorios&q=victoria' },
        ]
      },
      {
        title: 'Almacenamiento',
        items: [
          { label: 'Memorias / Pendrive',     href: '/products?category=Accesorios&q=memoria' },
          { label: 'SSD Externo',             href: '/products?category=Accesorios&q=ssd' },
          { label: 'Discos Duros',            href: '/products?category=Accesorios&q=hd' },
        ]
      },
      {
        title: 'Otros Accesorios',
        items: [
          { label: 'Auriculares',             href: '/products?category=Accesorios&q=auricular' },
          { label: 'Smartwatches / Garmin',   href: '/products?category=Accesorios&q=garmin' },
          { label: 'Cámaras / Drones',        href: '/products?category=Accesorios&q=cámara' },
          { label: 'Impresoras 3D',           href: '/products?category=Impresoras&q=filamento' },
          { label: 'Ver todo',                href: '/products?category=Accesorios' },
        ]
      },
    ]
  },
  {
    label: 'Más',
    href: '/products',
    cols: [
      {
        title: 'Monitores',
        items: [
          { label: 'Todos los Monitores',     href: '/products?category=Monitores' },
          { label: 'Monitores 4K',            href: '/products?category=Monitores&q=4k' },
          { label: 'Monitores Gaming',        href: '/products?category=Monitores&q=gaming' },
          { label: 'Monitores OLED / Curvo',  href: '/products?category=Monitores&q=oled' },
        ]
      },
      {
        title: 'Networking',
        items: [
          { label: 'Routers',                 href: '/products?category=Networking&q=router' },
          { label: 'Cámaras IP',              href: '/products?category=Networking&q=cámara' },
          { label: 'Smart Home',              href: '/products?category=Networking&q=smart' },
          { label: 'Tablets / Hub',           href: '/products?category=Networking&q=tablet' },
        ]
      },
      {
        title: 'Impresoras',
        items: [
          { label: 'Impresoras Inkjet / Láser', href: '/products?category=Impresoras&q=impresora' },
          { label: 'Filamentos 3D',           href: '/products?category=Impresoras&q=filamento' },
          { label: 'Resinas 3D',              href: '/products?category=Impresoras&q=resina' },
          { label: 'Cartuchos y Tóner',       href: '/products?category=Impresoras&q=cartucho' },
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
              {/* All categories button */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-4 py-3 text-sm font-700 text-white rounded-none"
                  style={{ background: 'var(--accent)', fontWeight: 700 }}
                  onMouseEnter={() => setOpenMenu('all')}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <Menu size={16} />
                  Categorías
                  <ChevronDown size={14} />
                </button>
              </div>

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
