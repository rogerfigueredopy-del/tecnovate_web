'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, ImagePlus, Loader2, Save, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['Notebooks','Componentes','Gaming','Celulares','Monitores','Accesorios','Impresoras','Networking']
const PC_SLOTS   = ['','CPU','MOTHERBOARD','RAM','GPU','STORAGE','PSU','CASE','COOLING']
const STATUSES   = [
  { value: 'ACTIVE',       label: 'Activo — visible en tienda' },
  { value: 'DRAFT',        label: 'Borrador — oculto' },
  { value: 'OUT_OF_STOCK', label: 'Sin stock' },
]

interface FormState {
  name: string; brand: string; sku: string; description: string
  price: string; oldPrice: string; stock: string
  category: string; pcBuilderSlot: string
  wattage: string; socket: string
  featured: boolean; status: string
}

interface Props {
  mode: 'new' | 'edit'
  productId?: string
  initialForm?: Partial<FormState>
  initialImages?: string[]
}

const DEFAULT_FORM: FormState = {
  name: '', brand: '', sku: '', description: '',
  price: '', oldPrice: '', stock: '0',
  category: 'Notebooks', pcBuilderSlot: '',
  wattage: '', socket: '', featured: false, status: 'ACTIVE',
}

// ── Reusable input ─────────────────────────────────────────────────
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-black mb-1.5" style={{ color: 'var(--text-secondary)' }}>
        {label}{required && <span style={{ color: 'var(--accent)' }}> *</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full rounded-xl px-3 py-2.5 text-sm outline-none transition-colors"
const inputStyle = { border: '1.5px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }
const focusAccent = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--accent)')
const blurBorder  = (e: React.FocusEvent<any>) => (e.target.style.borderColor = 'var(--border)')

export function ProductForm({ mode, productId, initialForm, initialImages = [] }: Props) {
  const router  = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [images, setImages]     = useState<string[]>(initialImages)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving]     = useState(false)
  const [form, setForm]         = useState<FormState>({ ...DEFAULT_FORM, ...initialForm })
  const set = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }))

  // ── Image upload ──────────────────────────────────────────────
  const handleImageUpload = async (files: FileList | null) => {
    if (!files?.length) return
    setUploading(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      try {
        const res  = await fetch('/api/upload', { method: 'POST', body: fd })
        const data = await res.json()
        if (data.url) urls.push(data.url)
      } catch {
        toast.error(`Error subiendo ${file.name}`)
      }
    }
    setImages(prev => [...prev, ...urls])
    setUploading(false)
    if (urls.length) toast.success(`${urls.length} imagen${urls.length > 1 ? 'es' : ''} subida${urls.length > 1 ? 's' : ''}`)
  }

  // ── Submit ────────────────────────────────────────────────────
  const handleSubmit = async (statusOverride?: string) => {
    if (!form.name || !form.brand || !form.price) {
      toast.error('Completá nombre, marca y precio')
      return
    }
    setSaving(true)
    const body = {
      ...form,
      price:    parseFloat(form.price),
      oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : undefined,
      stock:    parseInt(form.stock) || 0,
      wattage:  form.wattage ? parseInt(form.wattage) : undefined,
      socket:   form.socket || undefined,
      images,
      status:   statusOverride || form.status,
      pcBuilderSlot: form.pcBuilderSlot || undefined,
    }
    try {
      const res = await fetch(
        mode === 'new' ? '/api/products' : `/api/products/${productId}`,
        {
          method: mode === 'new' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      )
      if (!res.ok) throw new Error((await res.json()).error)
      toast.success(mode === 'new' ? '✓ Producto creado' : '✓ Producto actualizado')
      router.push('/admin/products')
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>

      {/* Header */}
      <div className="bg-white px-8 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>
              {mode === 'new' ? 'Nuevo Producto' : 'Editar Producto'}
            </h1>
            {mode === 'edit' && form.name && (
              <p className="text-sm mt-0.5 truncate max-w-sm" style={{ color: 'var(--text-muted)' }}>{form.name}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
              style={{ border: '1.5px solid var(--border)', color: 'var(--text-secondary)', background: 'white' }}
            >
              ← Volver
            </button>
            {mode === 'new' && (
              <button
                onClick={() => handleSubmit('DRAFT')}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-colors"
                style={{ border: '1.5px solid var(--border)', color: 'var(--text-secondary)', background: 'white' }}
              >
                Guardar borrador
              </button>
            )}
            <button
              onClick={() => handleSubmit()}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
              style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.3)' }}
            >
              {saving
                ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
                : <><Save size={14} />{mode === 'new' ? 'Publicar' : 'Guardar cambios'}</>
              }
            </button>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-4xl space-y-6">

        {/* ── Imágenes ──────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ImagePlus size={18} style={{ color: 'var(--accent)' }} />
            Imágenes del producto
          </h2>

          <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
            onChange={e => handleImageUpload(e.target.files)} />

          {/* Drop zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 hover:scale-[1.01]"
            style={{ border: '2px dashed var(--accent-light)', background: 'var(--accent-bg)' }}
          >
            {uploading ? (
              <div className="flex items-center justify-center gap-2" style={{ color: 'var(--accent)' }}>
                <Loader2 size={20} className="animate-spin" />
                <span className="text-sm font-bold">Subiendo imágenes...</span>
              </div>
            ) : (
              <>
                <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--accent-light)' }} />
                <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>
                  Clic para subir imágenes
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  PNG, JPG, WEBP — se optimizan automáticamente
                </p>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 0 && (
            <div className="grid grid-cols-5 gap-3">
              {images.map((url, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden group"
                  style={{ border: i === 0 ? '2px solid var(--accent)' : '1.5px solid var(--border)' }}>
                  <img src={url} alt="" className="w-full h-full object-contain p-2 bg-white" />
                  {i === 0 && (
                    <span className="absolute top-1 left-1 text-white text-xs font-black px-1.5 py-0.5 rounded-lg"
                      style={{ background: 'var(--accent)', fontSize: '10px' }}>
                      Principal
                    </span>
                  )}
                  <button
                    onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"
                    style={{ background: '#dc2626' }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Info básica ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>Información del producto</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Nombre" required>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Ej: Notebook ASUS ROG Strix G16"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
            <Field label="Marca" required>
              <input value={form.brand} onChange={e => set('brand', e.target.value)}
                placeholder="Ej: ASUS"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Categoría">
              <select value={form.category} onChange={e => set('category', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="SKU / Código">
              <input value={form.sku} onChange={e => set('sku', e.target.value)}
                placeholder="Ej: G513QY-HF021"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
          </div>
          <Field label="Descripción">
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              rows={3} placeholder="Descripción del producto..."
              className={`${inputCls} resize-none`} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
          </Field>
        </div>

        {/* ── Precios y stock ────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>Precios y Stock</h2>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Precio (Gs.)" required>
              <input type="number" value={form.price} onChange={e => set('price', e.target.value)}
                placeholder="1500000"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
            <Field label="Precio tachado (Gs.)">
              <input type="number" value={form.oldPrice} onChange={e => set('oldPrice', e.target.value)}
                placeholder="1800000"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
            <Field label="Stock">
              <input type="number" min="0" value={form.stock} onChange={e => set('stock', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
          </div>
          {form.price && form.oldPrice && parseFloat(form.oldPrice) > parseFloat(form.price) && (
            <p className="text-xs mt-2 font-black" style={{ color: '#16a34a' }}>
              ✓ Descuento: {Math.round((1 - parseFloat(form.price) / parseFloat(form.oldPrice)) * 100)}%
            </p>
          )}
        </div>

        {/* ── Publicación ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-base mb-5" style={{ color: 'var(--text-primary)' }}>Publicación</h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Estado">
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder}>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </Field>
            <Field label="PC Builder slot">
              <select value={form.pcBuilderSlot} onChange={e => set('pcBuilderSlot', e.target.value)}
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder}>
                <option value="">— No aplica —</option>
                {PC_SLOTS.filter(Boolean).map(s => <option key={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <Field label="Socket (CPU/MB)">
              <input value={form.socket} onChange={e => set('socket', e.target.value)}
                placeholder="Ej: AM5, LGA1700"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
            <Field label="Consumo (Watts)">
              <input type="number" value={form.wattage} onChange={e => set('wattage', e.target.value)}
                placeholder="Ej: 125"
                className={inputCls} style={inputStyle} onFocus={focusAccent} onBlur={blurBorder} />
            </Field>
          </div>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              onClick={() => set('featured', !form.featured)}
              className="w-11 h-6 rounded-full transition-colors relative"
              style={{ background: form.featured ? 'var(--accent)' : 'var(--border)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                style={{ left: form.featured ? 'calc(100% - 22px)' : '2px' }}
              />
            </div>
            <span className="text-sm font-black" style={{ color: 'var(--text-secondary)' }}>
              Destacar en la home
            </span>
          </label>
        </div>

        {/* ── Botones finales ────────────────────────────────── */}
        <div className="flex gap-3 pb-8">
          <button
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-7 py-3 rounded-xl font-black text-white text-sm transition-all hover:scale-105 disabled:opacity-60"
            style={{ background: 'var(--accent)', boxShadow: '0 4px 14px rgba(183,105,189,0.3)' }}
          >
            {saving
              ? <><Loader2 size={14} className="animate-spin" /> Guardando...</>
              : <><Save size={14} />{mode === 'new' ? 'Publicar producto' : 'Guardar cambios'}</>
            }
          </button>
          {mode === 'new' && (
            <button
              onClick={() => handleSubmit('DRAFT')}
              disabled={saving}
              className="px-7 py-3 rounded-xl font-bold text-sm transition-all"
              style={{ border: '1.5px solid var(--border)', color: 'var(--text-secondary)', background: 'white' }}
            >
              Guardar como borrador
            </button>
          )}
        </div>

      </div>
    </div>
  )
}
