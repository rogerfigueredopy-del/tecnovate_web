'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, PlusCircle, ShoppingCart, Users, CreditCard, Settings, LogOut, BarChart3 } from 'lucide-react'
import { signOut } from 'next-auth/react'

const links = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Productos', icon: Package },
  { href: '/admin/products/new', label: 'Cargar Producto', icon: PlusCircle },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/users', label: 'Usuarios', icon: Users },
  { href: '/admin/payments', label: 'Pagos', icon: CreditCard },
  { href: '/admin/stats', label: 'Estadísticas', icon: BarChart3 },
  { href: '/admin/settings', label: 'Configuración', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 min-h-screen">
      <div className="p-5 border-b border-gray-800">
        <Link href="/" className="text-lg font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          Tecnovate
        </Link>
        <div className="text-xs text-gray-500 mt-0.5">Panel Admin</div>
      </div>

      <nav className="flex-1 py-4">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-5 py-2.5 text-sm transition-all border-l-2 ${
                active
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-400/5 font-medium'
                  : 'text-gray-500 border-transparent hover:text-gray-300 hover:bg-white/3'
              }`}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 mb-3 transition-colors">
          ← Ver tienda
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-xs text-red-500 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
