'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUSES = [
  { value: 'PENDING',    label: 'Pendiente',   color: '#d97706' },
  { value: 'PAID',       label: 'Pagado',       color: '#16a34a' },
  { value: 'PROCESSING', label: 'Procesando',   color: 'var(--accent)' },
  { value: 'SHIPPED',    label: 'Enviado',      color: '#2563eb' },
  { value: 'DELIVERED',  label: 'Entregado',    color: '#16a34a' },
  { value: 'CANCELLED',  label: 'Cancelado',    color: '#dc2626' },
  { value: 'REFUNDED',   label: 'Reembolsado',  color: '#9ca3af' },
]

export function AdminOrderStatus({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleChange = async (newStatus: string) => {
    if (newStatus === status) return
    setSaving(true)
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      setStatus(newStatus)
      toast.success('Estado actualizado')
      router.refresh()
    } catch {
      toast.error('Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative">
      {saving ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
          style={{ background: 'var(--accent-bg)' }}>
          <Loader2 size={12} className="animate-spin" style={{ color: 'var(--accent)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Guardando...</span>
        </div>
      ) : (
        <div className="relative">
          <select
            value={status}
            onChange={e => handleChange(e.target.value)}
            disabled={saving}
            className="appearance-none text-xs font-black pl-3 pr-7 py-2 rounded-xl cursor-pointer outline-none"
            style={{
              border: '1.5px solid var(--border)',
              background: 'white',
              color: 'var(--text-primary)',
            }}
          >
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} />
        </div>
      )}
    </div>
  )
}
