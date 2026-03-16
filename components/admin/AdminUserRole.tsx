'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export function AdminUserRole({ userId, currentRole }: { userId: string; currentRole: string }) {
  const [role, setRole] = useState(currentRole)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleChange = async (newRole: string) => {
    if (newRole === role) return
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) throw new Error()
      setRole(newRole)
      toast.success('Rol actualizado')
      router.refresh()
    } catch {
      toast.error('Error al actualizar rol')
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={role}
      onChange={e => handleChange(e.target.value)}
      disabled={saving}
      className={`text-xs font-semibold px-2 py-1.5 rounded-lg border focus:outline-none cursor-pointer disabled:opacity-50 ${
        role === 'ADMIN'
          ? 'bg-purple-500/10 text-purple-400 border-purple-500/20'
          : 'bg-gray-800 text-gray-400 border-gray-700'
      }`}
    >
      <option value="CLIENT">Cliente</option>
      <option value="ADMIN">Admin</option>
    </select>
  )
}
