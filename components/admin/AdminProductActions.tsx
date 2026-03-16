'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Pencil, Trash2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export function AdminProductActions({ productId, productName }: { productId: string; productName: string }) {
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`¿Archivár "${productName}"? No se eliminará, solo se ocultará de la tienda.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      toast.success('Producto archivado')
      router.refresh()
    } catch {
      toast.error('Error al archivar el producto')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/admin/products/${productId}/edit`}
        className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Pencil size={14} />
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-gray-800 disabled:opacity-40 rounded-lg transition-colors"
      >
        {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      </button>
    </div>
  )
}
