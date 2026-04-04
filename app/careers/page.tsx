'use client'
import { useState } from 'react'
import { Briefcase, Heart, Zap, Users, Upload, CheckCircle, Send } from 'lucide-react'

const VALUES = [
  { icon: Zap,      title: 'Dinamismo',     desc: 'Equipo joven y comprometido con el crecimiento constante.' },
  { icon: Heart,    title: 'Pasión',        desc: 'Amamos la tecnología y eso se refleja en cada venta.' },
  { icon: Users,    title: 'Trabajo en equipo', desc: 'Colaboración, respeto y buen ambiente laboral.' },
  { icon: Briefcase,title: 'Oportunidad',   desc: 'Crecimiento real dentro de la empresa para quienes se destacan.' },
]

const POSITIONS = [
  'Ventas / Atención al cliente',
  'Logística y despacho',
  'Marketing digital / Redes sociales',
  'Soporte técnico',
  'Administración y finanzas',
  'Otro / Espontáneo',
]

export default function CareersPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', position: '', message: '', cvName: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setForm(f => ({ ...f, cvName: file.name }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setSent(true)
    setLoading(false)
  }

  const inputClass = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
  const inputStyle = { border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }
  const labelClass = "block text-xs font-black mb-1.5"
  const labelStyle = { color: 'var(--text-secondary)' }

  const onFocus = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--accent)')
  const onBlur  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--border)')

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#150030,#3b1075,#7c3aed)', minHeight: 180 }}>
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center">
          <h1 className="text-3xl font-black text-white mb-2">Trabaja con Nosotros</h1>
          <p style={{ color: 'rgba(255,255,255,0.75)' }}>Sumate al equipo Tecnovate y crezcamos juntos</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-10 space-y-8">

        {/* Por qué unirte */}
        <div className="grid sm:grid-cols-2 gap-4">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex gap-4 p-5 bg-white rounded-2xl" style={{ border: '1.5px solid var(--border)' }}>
              <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'var(--accent-bg)' }}>
                <Icon size={20} style={{ color: 'var(--accent)' }} />
              </div>
              <div>
                <p className="font-black text-sm mb-1" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl p-8" style={{ border: '1.5px solid var(--border)' }}>
          <h2 className="text-xl font-black mb-6" style={{ color: 'var(--text-primary)' }}>Dejanos tus datos</h2>

          {sent ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--accent-bg)' }}>
                <CheckCircle size={32} style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>¡Postulación recibida!</h3>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Gracias por tu interés en Tecnovate. Revisaremos tu perfil y te contactaremos a la brevedad si hay una oportunidad que se ajuste.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass} style={labelStyle}>Nombre completo *</label>
                  <input
                    required value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder="Tu nombre y apellido"
                    className={inputClass} style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
                <div>
                  <label className={labelClass} style={labelStyle}>Teléfono / WhatsApp *</label>
                  <input
                    required value={form.phone}
                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder="+595 9XX XXX XXX"
                    className={inputClass} style={inputStyle}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Email *</label>
                <input
                  required type="email" value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="tu@email.com"
                  className={inputClass} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Área de interés *</label>
                <select
                  required value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className={inputClass} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                >
                  <option value="">Seleccioná una opción</option>
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Contanos sobre vos</label>
                <textarea
                  rows={4} value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Experiencia previa, habilidades, disponibilidad horaria..."
                  className={`${inputClass} resize-none`} style={inputStyle}
                  onFocus={onFocus} onBlur={onBlur}
                />
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>CV / Currículum (PDF, Word)</label>
                <label
                  className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:opacity-80"
                  style={{ border: '1.5px dashed var(--accent)', background: 'var(--accent-bg)' }}
                >
                  <Upload size={18} style={{ color: 'var(--accent)' }} />
                  <span className="text-sm" style={{ color: form.cvName ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {form.cvName || 'Adjuntar CV (opcional)'}
                  </span>
                  <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleFile} />
                </label>
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
                    Enviar postulación
                  </>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
