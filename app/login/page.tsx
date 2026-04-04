'use client'
import { Suspense, useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

export const dynamic = 'force-dynamic'

function LoginPageInner() {
  const router = useRouter()
  const params = useSearchParams()
  const callbackUrl = params.get('callbackUrl') || '/'
  const [tab, setTab] = useState<'login' | 'register'>(
    params.get('tab') === 'register' ? 'register' : 'login'
  )
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await signIn('credentials', {
      email: form.email,
      password: form.password,
      redirect: false,
    })
    setLoading(false)
    if (res?.ok) {
      toast.success('¡Bienvenido!')
      router.push(callbackUrl)
    } else {
      toast.error('Email o contraseña incorrectos')
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('¡Cuenta creada! Iniciando sesión...')
      await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      router.push(callbackUrl)
    } catch (err: any) {
      toast.error(err.message || 'Error al registrarse')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--bg-secondary)' }}
    >
      {/* ── Left panel (solo desktop) ─────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <Link href="/"><img src="/logo.png" alt="Tecnovate" style={{ height: 80, width: 'auto', objectFit: 'contain' }} /></Link>
          <p className="text-sm mt-2" style={{ color: 'rgba(255,255,255,0.6)' }}>Tecnología de primera en Paraguay</p>
        </div>
        <div className="relative space-y-5">
          {[
            { icon: '🛡️', title: 'Compra segura',    desc: 'Pagos protegidos con Bancard y PayPal' },
            { icon: '🚚', title: 'Envío express',     desc: '24 h en Asunción y Gran Asunción' },
            { icon: '💜', title: 'Atención real',     desc: 'Equipo disponible por WhatsApp' },
          ].map(f => (
            <div key={f.title} className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                style={{ background: 'rgba(255,255,255,0.12)' }}>
                {f.icon}
              </div>
              <div>
                <p className="font-black text-sm text-white">{f.title}</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="relative text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          © {new Date().getFullYear()} Tecnovate. Asunción, Paraguay.
        </p>
      </div>

      {/* ── Right panel (form) ────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">

        {/* Mobile logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <Link href="/" className="lg:hidden mb-8"><img src="/logo.png" alt="Tecnovate" style={{ height: 64, width: 'auto', objectFit: 'contain' }} /></Link>

        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-lg" style={{ border: '1.5px solid var(--border)' }}>

            {/* Title */}
            <h1 className="text-2xl font-black mb-1" style={{ color: 'var(--text-primary)' }}>
              {tab === 'login' ? 'Bienvenido de vuelta' : 'Crear cuenta'}
            </h1>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              {tab === 'login' ? 'Ingresá para acceder a tus compras' : 'Unite a Tecnovate hoy'}
            </p>

            {/* Tabs */}
            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'var(--bg-secondary)' }}>
              {(['login', 'register'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 py-2 text-sm font-black rounded-lg transition-all"
                  style={{
                    background: tab === t ? 'white' : 'transparent',
                    color: tab === t ? 'var(--accent)' : 'var(--text-muted)',
                    boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  {t === 'login' ? 'Ingresar' : 'Registrarse'}
                </button>
              ))}
            </div>

            {/* Google */}
            <button
              onClick={() => signIn('google', { callbackUrl })}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.01] mb-5"
              style={{ border: '1.5px solid var(--border)', background: 'white', color: 'var(--text-primary)' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>o con email</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>

            {/* Form */}
            <form onSubmit={tab === 'login' ? handleLogin : handleRegister} className="space-y-3">

              {tab === 'register' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        required value={form.name} onChange={set('name')}
                        placeholder="Juan"
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                        style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Teléfono</label>
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        value={form.phone} onChange={set('phone')}
                        placeholder="+595 9..."
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                        style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    required type="email" value={form.email} onChange={set('email')}
                    placeholder="tu@email.com"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs font-black" style={{ color: 'var(--text-secondary)' }}>Contraseña *</label>
                  {tab === 'login' && (
                    <Link href="/forgot-password" className="text-xs font-bold" style={{ color: 'var(--accent)' }}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    required type={showPass ? 'text' : 'password'}
                    minLength={6} value={form.password} onChange={set('password')}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl text-sm outline-none transition-colors"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 mt-2"
                style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.35)' }}
              >
                {loading
                  ? <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  : <>{tab === 'login' ? 'Ingresar' : 'Crear cuenta'}<ArrowRight size={15} /></>
                }
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: 'var(--text-muted)' }}>
            Al continuar aceptás nuestros{' '}
            <Link href="/terms" className="font-bold" style={{ color: 'var(--accent)' }}>Términos</Link>
            {' '}y{' '}
            <Link href="/privacy" className="font-bold" style={{ color: 'var(--accent)' }}>Privacidad</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  )
}
