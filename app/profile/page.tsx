'use client'
import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Loader2, User, Mail, Phone, Save } from 'lucide-react'
import Image from 'next/image'

export default function ProfilePage() {
  const { data: session, update } = useSession()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: session?.user?.name || '',
    phone: '',
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      await update({ name: form.name })
      toast.success('Perfil actualizado')
    } catch {
      toast.error('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Necesitás iniciar sesión para ver tu perfil.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-2xl font-black mb-8">Mi Perfil</h1>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-gray-800">
          <div className="w-16 h-16 rounded-full bg-cyan-700 flex items-center justify-center text-2xl font-black overflow-hidden">
            {session.user?.image ? (
              <Image src={session.user.image} alt="avatar" width={64} height={64} className="rounded-full" />
            ) : (
              session.user?.name?.[0]?.toUpperCase() || 'U'
            )}
          </div>
          <div>
            <p className="font-bold text-lg">{session.user?.name}</p>
            <p className="text-sm text-gray-400">{session.user?.email}</p>
            <span className="text-xs bg-cyan-500/15 text-cyan-400 px-2 py-0.5 rounded-lg mt-1 inline-block">
              {(session.user as any)?.role === 'ADMIN' ? '👑 Administrador' : '🛒 Cliente'}
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <User size={12} /> Nombre completo
            </label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Mail size={12} /> Email
            </label>
            <input
              value={session.user?.email || ''}
              disabled
              className="w-full bg-gray-800/50 border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-600 mt-1">El email no se puede cambiar</p>
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1.5 flex items-center gap-1">
              <Phone size={12} /> Teléfono / WhatsApp
            </label>
            <input
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100"
              placeholder="+595 9XX XXX XXX"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold px-6 py-2.5 rounded-xl transition-colors text-sm"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Guardar cambios
          </button>
        </form>
      </div>
    </div>
  )
}
