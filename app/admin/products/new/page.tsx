'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, ImagePlus, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Notebooks', 'Componentes', 'Gaming', 'Celulares', 'Monitores', 'Accesorios', 'Impresoras', 'Networking']
const PC_SLOTS = ['', 'CPU', 'MOTHERBOARD', 'RAM', 'GPU', 'STORAGE', 'PSU', 'CASE', 'COOLING']

export default function NewProductPage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', brand: '', sku: '', description: '',
    price: '', oldPrice: '', stock: '0',
    category: 'Componentes', pcBuilderSlot: '',
    wattage: '', socket: '', featured: false, status: 'ACTIVE',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) urls.push(data.url)
      } catch {
        toast.error(`Error subiendo ${file.name}`)
      }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
    if (urls.length) toast.success(`${urls.length} imagen(es) subida(s)`)
  }

  const handleSubmit = async (status: string) => {
    if (!form.name || !form.brand || !form.price) {
      toast.error('Completá los campos obligatorios')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
          stock: parseInt(form.stock),
          wattage: form.wattage ? parseInt(form.wattage) : undefined,
          images,
          status,
          featured: form.featured,
          pcBuilderSlot: form.pcBuilderSlot || undefined,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(status === 'ACTIVE' ? '✓ Producto publicado' : '✓ Guardado como borrador')
      router.push('/admin/products')
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Nuevo Producto</h1>
          <p className="text-sm text-gray-500 mt-1">Completá el formulario y subí las imágenes</p>
        </div>
        <button onClick={() => router.back()} className="text-sm text-gray-400 hover:text-white px-4 py-2 border border-gray-700 rounded-xl transition-colors">
          ← Volver
        </button>
      </div>

      {/* Image upload */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4 flex items-center gap-2"><ImagePlus size={18} className="text-cyan-400" /> Imágenes del producto</h2>

        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files)} />

        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-xl p-8 text-center cursor-pointer transition-colors mb-4"
        >
          {uploading ? (
            <div className="flex items-center justify-center gap-2 text-cyan-400">
              <Loader2 size={20} className="animate-spin" />
              <span>Subiendo imágenes...</span>
            </div>
          ) : (
            <>
              <Upload size={28} className="mx-auto text-gray-500 mb-3" />
              <p className="text-sm font-medium text-gray-300">Arrastrá las fotos acá o hacé click</p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP — Máx 5MB — Hasta 8 fotos</p>
            </>
          )}
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            {images.map((url, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 group">
                <img src={url} alt="" className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-1 left-1 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-lg">Principal</span>
                )}
                <button
                  onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-lg p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Información del producto</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nombre *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="RTX 4070 Super 12GB" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Marca *</label>
            <input value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="NVIDIA, AMD, Apple..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Categoría *</label>
            <select value={form.category} onChange={e => set('category', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100">
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">SKU / Código</label>
            <input value={form.sku} onChange={e => set('sku', e.target.value)} placeholder="TV-GPU-4070S-001" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-gray-400 mb-1.5">Descripción</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Descripción detallada, especificaciones técnicas..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100 resize-none" />
        </div>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-4">Precio y Stock</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Precio (Gs.) *</label>
            <input type="number" value={form.price} onChange={e => set('price', e.target.value)} placeholder="2100000" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Precio anterior (Gs.)</label>
            <input type="number" value={form.oldPrice} onChange={e => set('oldPrice', e.target.value)} placeholder="Sin descuento" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Stock *</label>
            <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)} placeholder="15" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
        </div>
      </div>

      {/* PC Builder config */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="font-bold mb-1">Configuración PC Builder</h2>
        <p className="text-xs text-gray-500 mb-4">Si este producto es un componente de PC, configuralo para aparecer en el armador</p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Slot PC Builder</label>
            <select value={form.pcBuilderSlot} onChange={e => set('pcBuilderSlot', e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100">
              <option value="">No aplica</option>
              {PC_SLOTS.filter(Boolean).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Consumo (W)</label>
            <input type="number" value={form.wattage} onChange={e => set('wattage', e.target.value)} placeholder="220" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Socket (CPU/MB)</label>
            <input value={form.socket} onChange={e => set('socket', e.target.value)} placeholder="AM5, LGA1700..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="flex items-center gap-4 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded accent-cyan-500" />
          <span className="text-sm text-gray-300">Destacar en inicio</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => handleSubmit('ACTIVE')} disabled={saving} className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-700 text-black font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          {saving ? <Loader2 size={16} className="animate-spin" /> : null}
          Publicar producto
        </button>
        <button onClick={() => handleSubmit('DRAFT')} disabled={saving} className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-6 py-3 rounded-xl transition-colors text-sm">
          Guardar borrador
        </button>
      </div>
    </div>
  )
}
