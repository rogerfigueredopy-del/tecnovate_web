import Link from 'next/link'

const TEAM = [
  { name: 'Carlos Martínez',   role: 'Gerente General',     phone: '595984000001', emoji: '👨‍💼' },
  { name: 'Laura Benítez',     role: 'Jefa de Ventas',      phone: '595984000002', emoji: '👩‍💼' },
  { name: 'Diego Sosa',        role: 'Soporte Técnico',     phone: '595984000003', emoji: '🧑‍💻' },
  { name: 'Ana González',      role: 'Atención al Cliente', phone: '595984000004', emoji: '👩‍🦱' },
  { name: 'Marcos Rojas',      role: 'Logística',           phone: '595984000005', emoji: '🧑‍🔧' },
  { name: 'Sofía Duarte',      role: 'Marketing',           phone: '595984000006', emoji: '👩‍🎨' },
  { name: 'Pablo Núñez',       role: 'Ventas Online',       phone: '595984000007', emoji: '🧑‍💼' },
  { name: 'Valeria Torres',    role: 'Postventa',           phone: '595984000008', emoji: '👩‍🔧' },
]

const VALUES = [
  { icon: '🚀', title: 'Innovación',            desc: 'Siempre a la vanguardia con la última tecnología del mercado.' },
  { icon: '🛡️', title: 'Garantía Real',          desc: 'Todos nuestros productos cuentan con garantía oficial de fábrica.' },
  { icon: '💜', title: 'Atención Personalizada', desc: 'Te acompañamos antes, durante y después de tu compra.' },
  { icon: '🚚', title: 'Envío Express',           desc: 'Entrega el mismo día en Ciudad del Este y a todo el país.' },
]

const STATS = [
  { num: '5.000+', label: 'Clientes felices' },
  { num: '10.000+', label: 'Productos vendidos' },
  { num: '3',       label: 'Años en el mercado' },
  { num: '4.9★',   label: 'Calificación promedio' },
]

export default function AboutPage() {
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-4xl mx-auto px-6 text-center text-white">
          <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            Quiénes somos
          </span>
          <h1 className="text-4xl md:text-5xl font-black mb-4" style={{ lineHeight: 1.1 }}>
            Tecnología de Primera<br />en Paraguay
          </h1>
          <p className="text-base opacity-80 max-w-xl mx-auto leading-relaxed">
            Somos Tecnovate — la tienda de tecnología de Ciudad del Este que combina los mejores precios con atención personalizada de verdad.
          </p>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-4xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{s.num}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Historia ─────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Nuestra historia</p>
            <h2 className="text-3xl font-black mb-4" style={{ color: 'var(--text-primary)' }}>
              Nacimos para acercar la tecnología a los paraguayos
            </h2>
            <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Desde Ciudad del Este, el corazón tecnológico del país, trabajamos cada día para que tengas acceso a las últimas novedades: notebooks, celulares, componentes gaming y mucho más.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-secondary)' }}>
              Somos un equipo apasionado por la tecnología que entiende las necesidades del mercado paraguayo — con precios justos, stock real y atención que te hace sentir en casa.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/products"
                className="px-5 py-2.5 rounded-xl font-black text-sm text-white transition-all hover:scale-105"
                style={{ background: 'var(--accent)' }}>
                Ver productos
              </Link>
              <Link href="/contact"
                className="px-5 py-2.5 rounded-xl font-black text-sm transition-all hover:scale-105"
                style={{ border: '2px solid var(--accent)', color: 'var(--accent)', background: 'var(--accent-bg)' }}>
                Contactanos
              </Link>
            </div>
          </div>
          <div className="relative">
            <div
              className="rounded-2xl aspect-video flex items-center justify-center text-8xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--accent-bg), #e8c8ec)' }}
            >
              🏪
            </div>
            <div
              className="absolute -bottom-4 -right-4 w-20 h-20 rounded-2xl flex items-center justify-center text-3xl shadow-xl"
              style={{ background: 'var(--accent)' }}
            >
              💜
            </div>
          </div>
        </div>
      </section>

      {/* ── Valores ──────────────────────────────────────── */}
      <section className="bg-white py-16 border-y" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>Lo que nos define</p>
            <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Nuestros Valores</h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title}
                className="rounded-2xl p-6 text-center transition-all hover:-translate-y-1"
                style={{ border: '2px solid var(--border)', background: 'var(--bg-secondary)' }}
              >
                <div className="text-4xl mb-3">{v.icon}</div>
                <h3 className="font-black text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Equipo ───────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--accent)' }}>El equipo</p>
          <h2 className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>Nuestro Equipo de Ventas</h2>
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Personas reales, atención real — contactalos por WhatsApp</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-4">
          {TEAM.map(member => (
            <a
              key={member.name}
              href={`https://wa.me/${member.phone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center text-center p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-lg"
              style={{ border: '2px solid var(--border)', background: 'white' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110"
                style={{ background: 'var(--accent-bg)', border: '2px solid var(--accent-light)' }}
              >
                {member.emoji}
              </div>
              <p className="font-black text-xs leading-tight mb-0.5" style={{ color: 'var(--text-primary)', fontSize: '11px' }}>
                {member.name}
              </p>
              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{member.role}</p>
              <span className="text-xs font-black px-2 py-0.5 rounded-lg" style={{ background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: '10px' }}>
                WhatsApp
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section
        className="relative overflow-hidden mx-4 mb-8 rounded-2xl py-14 text-center"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative text-white px-4">
          <h2 className="text-3xl font-black mb-3">¿Tenés alguna duda?</h2>
          <p className="opacity-80 mb-6 text-sm">Nuestro equipo está listo para ayudarte a elegir el producto ideal.</p>
          <Link href="/contact"
            className="inline-block px-8 py-3 rounded-xl font-black text-sm transition-all hover:scale-105 shadow-lg"
            style={{ background: 'white', color: '#7b2d9e' }}>
            Contactanos →
          </Link>
        </div>
      </section>

    </div>
  )
}
