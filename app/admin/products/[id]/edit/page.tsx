'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { Loader2 } from 'lucide-react'

export default function EditProductPage() {
  const params = useParams()
  const [data, setData]       = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then(r => r.json())
      .then(p => setData(p))
      .finally(() => setLoading(false))
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: 'var(--bg-secondary)' }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--accent)' }} />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64" style={{ background: 'var(--bg-secondary)' }}>
        <p style={{ color: 'var(--text-muted)' }}>Producto no encontrado.</p>
      </div>
    )
  }

  return (
    <ProductForm
      mode="edit"
      productId={params.id as string}
      initialImages={data.images || []}
      initialForm={{
        name:          data.name        || '',
        brand:         data.brand       || '',
        sku:           data.sku         || '',
        description:   data.description || '',
        price:         String(data.price  || ''),
        oldPrice:      data.oldPrice ? String(data.oldPrice) : '',
        stock:         String(data.stock  || 0),
        category:      data.category?.name || 'Notebooks',
        pcBuilderSlot: data.pcBuilderSlot  || '',
        wattage:       data.wattage ? String(data.wattage) : '',
        socket:        data.socket  || '',
        featured:      data.featured || false,
        status:        data.status   || 'ACTIVE',
      }}
    />
  )
}
