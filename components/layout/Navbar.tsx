'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingCart, User, Search, Zap, Shield } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function Navbar() {
  const { data: session } = useSession()
  const cartCount = useCartStore(s => s.items.reduce((n, i) => n + i.quantity, 0))
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) router.push(`/products?q=${encodeURIComponent(search)}`)
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      {/* Top bar */}
      <div className="bg-gray-950 text-xs text-gray-400 py-1.5">
        <div className="container mx-auto px-4 flex justify-between">
          <span>📦 Envíos a todo Paraguay | WhatsApp: +595 9XX XXX XXX</span>
          <div className="flex gap-4">
            <Link href="/track" className="hover:text-cyan-400">Rastrear pedido</Link>
            <Link href="/about" className="hover:text-cyan-400">Nosotros</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="container mx-auto px-4 h-16 flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Tecnovate
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar productos, marcas..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-cyan-500 text-gray-100 placeholder-gray-500"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400">
              <Search size={16} />
            </button>
          </div>
        </form>

        {/* Nav links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm">
          <Link href="/products" className="text-gray-300 hover:text-white">Productos</Link>
          <Link href="/gamer" className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold">
            <Zap size={14} />
            Zona Gamer
          </Link>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Cart */}
          <Link href="/cart" className="relative p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <ShoppingCart size={20} className="text-gray-300" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {session ? (
            <div className="flex items-center gap-2">
              {(session.user as any)?.role === 'ADMIN' && (
                <Link href="/admin" className="flex items-center gap-1 text-xs bg-purple-900/50 text-purple-300 border border-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-900 transition-colors">
                  <Shield size={12} />
                  Admin
                </Link>
              )}
              <div className="relative group">
                <button className="flex items-center gap-2 p-1.5 hover:bg-gray-800 rounded-lg">
                  {session.user?.image ? (
                    <Image src={session.user.image} alt="avatar" width={28} height={28} className="rounded-full" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-cyan-700 flex items-center justify-center text-xs font-bold">
                      {session.user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </button>
                <div className="absolute right-0 top-10 w-48 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto">
                  <div className="p-3 border-b border-gray-800">
                    <p className="text-sm font-semibold truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                  </div>
                  <div className="p-2">
                    <Link href="/profile" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">Mi perfil</Link>
                    <Link href="/orders" className="block px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg">Mis pedidos</Link>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-gray-800 rounded-lg"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login" className="text-sm text-gray-300 hover:text-white px-3 py-1.5 border border-gray-700 rounded-lg hover:border-cyan-500 transition-colors">
                Ingresar
              </Link>
              <Link href="/login?tab=register" className="text-sm bg-cyan-500 hover:bg-cyan-400 text-black font-semibold px-3 py-1.5 rounded-lg transition-colors">
                Registrarse
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
