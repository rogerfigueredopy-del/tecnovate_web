'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, PlusCircle, ShoppingCart,
  Users, CreditCard, Settings, LogOut, BarChart3, Store
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin',               label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { href: '/admin/products',      label: 'Productos',       icon: Package },
  { href: '/admin/products/new',  label: 'Nuevo Producto',  icon: PlusCircle },
  { href: '/admin/orders',        label: 'Pedidos',         icon: ShoppingCart },
  { href: '/admin/users',         label: 'Usuarios',        icon: Users },
  { href: '/admin/payments',      label: 'Pagos',           icon: CreditCard },
  { href: '/admin/stats',         label: 'Estadísticas',    icon: BarChart3 },
  { href: '/admin/settings',      label: 'Configuración',   icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="w-56 flex flex-col shrink-0 min-h-screen"
      style={{ background: 'white', borderRight: '1.5px solid var(--border)' }}
    >
      {/* Logo */}
      <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <Link href="/" className="text-lg font-black" style={{ color: 'var(--accent)' }}>
          Tecnovate
        </Link>
        <div className="text-xs mt-0.5 font-semibold" style={{ color: 'var(--text-muted)' }}>Panel Admin</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-all border-l-2 mx-2 rounded-r-xl"
              style={{
                borderLeftColor: active ? 'var(--accent)' : 'transparent',
                background: active ? 'var(--accent-bg)' : 'transparent',
                color: active ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: active ? 700 : 500,
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold mb-3 transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          <Store size={13} />
          Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-xs font-semibold transition-colors hover:opacity-80"
          style={{ color: '#dc2626' }}
        >
          <LogOut size={13} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
