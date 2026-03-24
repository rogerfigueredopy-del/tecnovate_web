'use client'
import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle } from 'lucide-react'

const CONTACT_INFO = [
  { icon: MapPin,        label: 'Dirección',    value: 'Ciudad del Este, Alto Paraná, Paraguay' },
  { icon: Phone,         label: 'Teléfono',     value: '+595 984 000 001' },
  { icon: Mail,          label: 'Email',        value: 'ventas@tecnovate.com.py' },
  { icon: Clock,         label: 'Horario',      value: 'Lun – Sáb 8:00 – 18:00' },
]

const WHATSAPP_TOPICS = [
  { emoji: '💻', label: 'Notebooks y PCs' },
  { emoji: '📱', label: 'Celulares' },
  { emoji: '🎮', label: 'Gaming' },
  { emoji: '🔧', label: 'Soporte técnico' },
  { emoji: '📦', label: 'Mi pedido' },
  { emoji: '💳', label: 'Pagos y envíos' },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // Simulamos el envío (podés conectar a tu API o EmailJS)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-16"
        style={{ background: 'linear-gradient(135deg, #2d0a40 0%, #7b2d9e 50%, #b769bd 100%)' }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center text-white">
          <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>
            Estamos para vos
          </span>
          <h1 className="text-4xl font-black mb-3">Contacto</h1>
          <p className="opacity-80 text-sm leading-relaxed max-w-md mx-auto">
            Tenés alguna pregunta, consulta técnica o querés saber más sobre un producto? Escribinos.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">

        {/* ── Formulario ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-8 shadow-sm" style={{ border: '1px solid var(--border)' }}>
          {sent ? (
            <div className="text-center py-10">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: 'var(--accent-bg)' }}
              >
                <CheckCircle size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>¡Mensaje enviado!</h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
                Te respondemos a la brevedad por email o WhatsApp.
              </p>
              <button
                onClick={() => { setSent(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }) }}
                className="text-sm font-black px-5 py-2 rounded-xl transition-all hover:scale-105"
                style={{ background: 'var(--accent)', color: 'white' }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Envianos un mensaje</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Nombre *</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tu nombre"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Teléfono</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+595 9XX XXX XXX"
                      className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                      style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Email *</label>
                  <input
                    required type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Asunto</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                    placeholder="¿En qué te podemos ayudar?"
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                <div>
                  <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>Mensaje *</label>
                  <textarea
                    required rows={4}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="Escribí tu consulta acá..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors resize-none"
                    style={{ border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                    onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                    onBlur={e => (e.target.style.borderColor = 'var(--border)')}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02] disabled:opacity-60"
                  style={{ background: 'var(--accent)' }}
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Send size={15} />
                      Enviar mensaje
                    </>
                  )}
                </button>
              </form>
            </>
          )}
        </div>

        {/* ── Info + WhatsApp ──────────────────────────────── */}
        <div className="space-y-5">

          {/* Info cards */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
            <h3 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>Información de contacto</h3>
            <div className="space-y-4">
              {CONTACT_INFO.map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-bg)' }}
                  >
                    <Icon size={16} style={{ color: 'var(--accent)' }} />
                  </div>
                  <div>
                    <p className="text-xs font-black" style={{ color: 'var(--text-muted)' }}>{label}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* WhatsApp rápido */}
          <div className="bg-white rounded-2xl p-6 shadow-sm" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <MessageCircle size={18} style={{ color: '#22c55e' }} />
              <h3 className="font-black text-base" style={{ color: 'var(--text-primary)' }}>Escribinos por WhatsApp</h3>
            </div>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Seleccioná el tema y te conectamos con el especialista:</p>
            <div className="grid grid-cols-2 gap-2">
              {WHATSAPP_TOPICS.map(t => (
                <a
                  key={t.label}
                  href={`https://wa.me/595984000001?text=Hola! Consulta sobre: ${encodeURIComponent(t.label)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-bold transition-all hover:-translate-y-0.5 hover:shadow-sm"
                  style={{ border: '1.5px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  <span>{t.emoji}</span>
                  {t.label}
                </a>
              ))}
            </div>
            <a
              href="https://wa.me/595984000001"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-[1.02]"
              style={{ background: '#22c55e' }}
            >
              <MessageCircle size={16} />
              Abrir WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}
