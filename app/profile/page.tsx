'use client'
import { useSession, signOut } from 'next-auth/react'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Package, Heart, MapPin, LogOut, ChevronRight, ShoppingBag, Settings, Shield } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Pendiente',
  PAID:       'Pagado',
  PROCESSING: 'Procesando',
  SHIPPED:    'Enviado',
  DELIVERED:  'Entregado',
  CANCELLED:  'Cancelado',
}
const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  PENDING:    { bg: '#fffbeb', color: '#d97706' },
  PAID:       { bg: '#f0fdf4', color: '#16a34a' },
  PROCESSING: { bg: 'var(--accent-bg)', color: 'var(--accent)' },
  SHIPPED:    { bg: '#eff6ff', color: '#2563eb' },
  DELIVERED:  { bg: '#f0fdf4', color: '#16a34a' },
  CANCELLED:  { bg: '#fff5f5', color: '#dc2626' },
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loadingOrders, setLoadingOrders] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login?callbackUrl=/profile')
  }, [status, router])

  useEffect(() => {
    if (session) {
      fetch('/api/orders?limit=5')
        .then(r => r.json())
        .then(d => setOrders(d.orders || []))
        .catch(() => setOrders([]))
        .finally(() => setLoadingOrders(false))
    }
  }, [session])

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-t-transparent" style={{ borderColor: 'var(--accent)' }} />
      </div>
    )
  }

  const user = session.user as any
  const initials = user.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user.email?.[0]?.toUpperCase() || '?'

  const MENU_ITEMS = [
    { href: '/orders',   icon: Package,    label: 'Mis Pedidos',        desc: 'Ver historial de compras' },
    { href: '/wishlist', icon: Heart,      label: 'Mis Favoritos',      desc: 'Productos guardados' },
    { href: '/track',    icon: ShoppingBag, label: 'Rastrear Pedido',   desc: 'Ver estado de envío' },
  ]

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Header ───────────────────────────────────────── */}
      <div
        className="relative overflow-hidden py-12"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 flex items-center gap-5">
          {/* Avatar */}
          <div
            className="w-18 h-18 rounded-2xl flex items-center justify-center text-2xl font-black text-white shrink-0 shadow-lg"
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.3)',
              width: '72px', height: '72px',
            }}
          >
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full rounded-2xl object-cover" />
              : initials
            }
          </div>
          <div className="text-white">
            <h1 className="text-2xl font-black">{user.name || 'Mi Cuenta'}</h1>
            <p className="opacity-70 text-sm">{user.email}</p>
            {user.role === 'ADMIN' && (
              <span className="inline-block mt-1 text-xs font-black px-2 py-0.5 rounded-lg"
                style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)' }}>
                👑 Administrador
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-5">

        {/* ── Admin acceso rápido ──────────────────────────── */}
        {user.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ background: 'var(--accent)', border: '1px solid var(--accent-dark)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
              <Shield size={18} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="font-black text-white text-sm">Panel de Administración</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>Gestionar productos, pedidos y usuarios</p>
            </div>
            <ChevronRight size={16} className="text-white opacity-60" />
          </Link>
        )}

        {/* ── Menú principal ──────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
          {MENU_ITEMS.map(({ href, icon: Icon, label, desc }, idx) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
              style={{ borderBottom: idx < MENU_ITEMS.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--accent-bg)' }}
              >
                <Icon size={18} style={{ color: 'var(--accent)' }} />
              </div>
              <div className="flex-1">
                <p className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{desc}</p>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)' }} />
            </Link>
          ))}
        </div>

        {/* ── Pedidos recientes ────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Pedidos recientes</h2>
            <Link href="/orders" className="text-xs font-black" style={{ color: 'var(--accent)' }}>Ver todos →</Link>
          </div>

          {loadingOrders ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-6 h-6 rounded-full border-2 border-t-transparent mx-auto" style={{ borderColor: 'var(--accent)' }} />
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center">
              <Package size={32} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Sin pedidos todavía</p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'var(--text-muted)' }}>Cuando hagas tu primera compra aparecerá acá</p>
              <Link href="/products"
                className="inline-block px-5 py-2 rounded-xl font-black text-white text-xs"
                style={{ background: 'var(--accent)' }}>
                Ver productos
              </Link>
            </div>
          ) : (
            <div>
              {orders.map((order, idx) => {
                const sc = STATUS_COLORS[order.status] || { bg: 'var(--bg-secondary)', color: 'var(--text-muted)' }
                return (
                  <Link
                    key={order.id}
                    href="/orders"
                    className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50"
                    style={{ borderBottom: idx < orders.length - 1 ? '1px solid var(--border)' : 'none' }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: sc.bg }}>
                      <Package size={16} style={{ color: sc.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-mono text-xs font-black" style={{ color: 'var(--text-muted)' }}>
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-sm font-semibold mt-0.5 truncate" style={{ color: 'var(--text-primary)' }}>
                        {order.items?.[0]?.product?.name || 'Pedido'}
                        {order.items?.length > 1 && ` +${order.items.length - 1}`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-sm" style={{ color: 'var(--accent)' }}>{formatPrice(order.total)}</p>
                      <span className="text-xs font-black px-2 py-0.5 rounded-lg"
                        style={{ background: sc.bg, color: sc.color }}>
                        {STATUS_LABELS[order.status] || order.status}
                      </span>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Datos de la cuenta ───────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm" style={{ border: '1px solid var(--border)' }}>
          <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <h2 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>Datos de la cuenta</h2>
          </div>
          <div className="px-5 py-4 space-y-3">
            {[
              { label: 'Nombre',   value: user.name || '—' },
              { label: 'Email',    value: user.email || '—' },
              { label: 'Cuenta',   value: user.role === 'ADMIN' ? 'Administrador' : 'Cliente' },
            ].map(row => (
              <div key={row.label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--text-muted)' }}>{row.label}</span>
                <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Cerrar sesión ────────────────────────────────── */}
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl font-black text-sm transition-all hover:scale-[1.01]"
          style={{ background: 'white', border: '1.5px solid #fecaca', color: '#dc2626' }}
        >
          <LogOut size={15} />
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}
