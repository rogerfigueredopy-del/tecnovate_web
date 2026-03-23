'use client'
// app/admin/importar/page.tsx
// Panel de importación masiva desde Excel de Atacado Connect

import { useState, useRef, useCallback } from 'react'
import * as XLSX from 'xlsx'

// ── Tipos ────────────────────────────────────────────────────
interface Producto {
  nombre: string
  slug: string
  sku: string
  categoria: string
  precio_usd: number
  imagen: string
  url_proveedor: string
  stock: number
}

interface Stats {
  insertados: number
  errores: number
  omitidos: number
}

// ── Categoría del proveedor → Tecnovate ──────────────────────
const CAT_MAP: Record<string, string> = {
  smartphones: 'Celulares', celulares: 'Celulares', smartwatch: 'Accesorios',
  notebooks: 'Notebooks', consoles: 'Gaming', playstation: 'Gaming',
  nintendo: 'Gaming', xbox: 'Gaming', jogos: 'Gaming', controles: 'Gaming',
  processadores: 'Componentes', 'placas-mae': 'Componentes',
  'placas-de-video': 'Componentes', 'memoria-ram': 'Componentes',
  ssd: 'Componentes', monitores: 'Monitores', mouses: 'Accesorios',
  teclados: 'Accesorios', headsets: 'Accesorios', gabinetes: 'Componentes',
  'smart-tv': 'Electrónicos',
}

// ── Helpers ───────────────────────────────────────────────────
function slugify(t: string) {
  return t.toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

function parsearUSD(texto: string): number {
  if (!texto) return 0
  const limpio = String(texto).replace(/[^\d,.]/g, '')
  const norm = limpio.includes(',') && limpio.includes('.')
    ? limpio.replace(/\./g, '').replace(',', '.')
    : limpio.replace(',', '.')
  return parseFloat(norm) || 0
}

function formatPYG(usd: number, cambio: number, margen: number) {
  return 'Gs. ' + Math.round(usd * cambio * (1 + margen / 100)).toLocaleString('es-PY')
}

// ── Componente principal ──────────────────────────────────────
export default function ImportarPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [margen, setMargen] = useState(30)
  const [categoria, setCategoria] = useState('Celulares')
  const [cambio, setCambio] = useState<number | null>(null)
  const [paso, setPaso] = useState<'idle' | 'preview' | 'importing' | 'done'>('idle')
  const [progreso, setProgreso] = useState(0)
  const [stats, setStats] = useState<Stats | null>(null)
  const [mensaje, setMensaje] = useState('')
  const [reemplazar, setReemplazar] = useState(false)
  const [busqueda, setBusqueda] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  // ── Cargar tipo de cambio ─────────────────────────────────
  async function cargarCambio() {
    try {
      const r = await fetch('https://open.er-api.com/v6/latest/USD')
      const d = await r.json()
      setCambio(d.rates?.PYG || 7800)
    } catch {
      setCambio(7800)
    }
  }

  // ── Leer Excel ────────────────────────────────────────────
  const leerExcel = useCallback(async (file: File) => {
    await cargarCambio()
    const buffer = await file.arrayBuffer()
    const wb = XLSX.read(buffer, { type: 'array' })
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' })

    if (!rows.length) { setMensaje('El archivo está vacío'); return }

    // Detectar columnas automáticamente
    const keys = Object.keys(rows[0]).map(k => k.toLowerCase())
    const colNombre = Object.keys(rows[0]).find(k => /produ|nome|name|descr/i.test(k)) || ''
    const colPrecio = Object.keys(rows[0]).find(k => /prec|price|valor|usd/i.test(k)) || ''
    const colCodigo = Object.keys(rows[0]).find(k => /cod|id/i.test(k)) || ''
    const colImagen = Object.keys(rows[0]).find(k => /imag|foto/i.test(k)) || ''

    const prods: Producto[] = rows
      .map((row: any) => {
        const nombre = String(row[colNombre] || '').trim()
        const usd = parsearUSD(String(row[colPrecio] || ''))
        const sku = String(row[colCodigo] || '').replace('.0', '').trim()
        const imgRaw = String(row[colImagen] || '').trim()
        const imagen = imgRaw && imgRaw !== 'nan'
          ? imgRaw.startsWith('http') ? imgRaw : `https://cdn.atacadoconnect.com/produtos/${sku}/${imgRaw}`
          : sku ? `https://cdn.atacadoconnect.com/produtos/${sku}/foto.jpg` : ''

        return {
          nombre,
          slug: sku ? `${slugify(nombre)}-${sku}` : slugify(nombre),
          sku,
          categoria,
          precio_usd: usd,
          imagen,
          url_proveedor: sku ? `https://atacadoconnect.com/produto/${sku}` : '',
          stock: 999,
        }
      })
      .filter(p => p.nombre && p.precio_usd > 0)

    setProductos(prods)
    setPaso('preview')
    setMensaje(`${prods.length} productos listos para importar`)
  }, [categoria])

  // ── Importar ──────────────────────────────────────────────
  async function importar() {
    if (!productos.length) return
    setPaso('importing')
    setProgreso(0)

    const CHUNK = 200
    const lotes = []
    for (let i = 0; i < productos.length; i += CHUNK)
      lotes.push(productos.slice(i, i + CHUNK))

    const statsAcum: Stats = { insertados: 0, errores: 0, omitidos: 0 }

    for (let i = 0; i < lotes.length; i++) {
      setProgreso(Math.round((i / lotes.length) * 90))
      setMensaje(`Importando lote ${i + 1} de ${lotes.length}...`)

      try {
        const res = await fetch('/api/admin/import-products', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ADMIN_KEY || ''}`,
          },
          body: JSON.stringify({
            productos: lotes[i],
            reemplazar: i === 0 ? reemplazar : false,
          }),
        })
        const data = await res.json()
        if (data.stats) {
          statsAcum.insertados += data.stats.insertados || 0
          statsAcum.errores += data.stats.errores || 0
          statsAcum.omitidos += data.stats.omitidos || 0
        }
      } catch (e) {
        statsAcum.errores += lotes[i].length
      }
    }

    setProgreso(100)
    setStats(statsAcum)
    setPaso('done')
    setMensaje(`¡Importación completada! ${statsAcum.insertados} productos cargados`)
  }

  // ── Filtrar preview ───────────────────────────────────────
  const productosFiltrados = productos.filter(p =>
    !busqueda || p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.sku.includes(busqueda)
  )

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 4px' }}>Importar productos</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
          Descargá el Excel desde Atacado Connect → "Descargar lista" y subilo acá
        </p>
      </div>

      {/* Configuración */}
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>

          {/* Categoría */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Categoría de Tecnovate
            </label>
            <select
              value={categoria}
              onChange={e => setCategoria(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
            >
              {['Celulares','Notebooks','Gaming','Componentes','Monitores','Accesorios','Electrónicos','Networking','Impresoras'].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Margen */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Margen de ganancia: <strong>{margen}%</strong>
            </label>
            <input
              type="range" min={5} max={80} step={1} value={margen}
              onChange={e => setMargen(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
              <span>5%</span><span>80%</span>
            </div>
          </div>

          {/* Cambio del día */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>
              Cambio USD → PYG
            </label>
            <div style={{ padding: '8px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14, background: '#f9fafb', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: cambio ? '#22c55e' : '#d1d5db', display: 'inline-block' }} />
              {cambio
                ? `1 USD = ${cambio.toLocaleString('es-PY', { maximumFractionDigits: 0 })} PYG`
                : <button onClick={cargarCambio} style={{ border: 'none', background: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: 13 }}>Obtener cambio</button>
              }
            </div>
          </div>

          {/* Opciones */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 6 }}>Opciones</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}>
              <input type="checkbox" checked={reemplazar} onChange={e => setReemplazar(e.target.checked)} />
              Reemplazar productos existentes
            </label>
          </div>
        </div>
      </div>

      {/* Zona de carga */}
      {paso === 'idle' && (
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            border: '2px dashed #d1d5db', borderRadius: 12, padding: '48px 24px',
            textAlign: 'center', cursor: 'pointer', background: '#fafafa',
            transition: 'all 0.2s',
          }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#3b82f6' }}
          onDragLeave={e => { e.currentTarget.style.borderColor = '#d1d5db' }}
          onDrop={e => {
            e.preventDefault()
            e.currentTarget.style.borderColor = '#d1d5db'
            const f = e.dataTransfer.files[0]
            if (f) leerExcel(f)
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
          <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 4px' }}>
            Subí el Excel de Atacado Connect
          </p>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Arrastrá el archivo acá o hacé clic para seleccionarlo
          </p>
          <input
            ref={fileRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) leerExcel(f) }}
          />
        </div>
      )}

      {/* Barra de progreso */}
      {paso === 'importing' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '32px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 14, color: '#374151', marginBottom: 16 }}>{mensaje}</div>
          <div style={{ background: '#e5e7eb', borderRadius: 8, height: 8, margin: '0 auto', maxWidth: 400 }}>
            <div style={{ width: `${progreso}%`, height: '100%', background: '#3b82f6', borderRadius: 8, transition: 'width 0.3s' }} />
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{progreso}%</div>
        </div>
      )}

      {/* Resultado */}
      {paso === 'done' && stats && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '24px', marginBottom: 20 }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: '#166534', marginBottom: 12 }}>✅ {mensaje}</div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {[
              { label: 'Insertados', value: stats.insertados, color: '#166534' },
              { label: 'Errores', value: stats.errores, color: '#dc2626' },
              { label: 'Omitidos', value: stats.omitidos, color: '#d97706' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{s.label}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { setPaso('idle'); setProductos([]); setStats(null) }}
            style={{ marginTop: 16, padding: '8px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}
          >
            Importar otro archivo
          </button>
        </div>
      )}

      {/* Preview de productos */}
      {paso === 'preview' && productos.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, overflow: 'hidden' }}>

          {/* Toolbar del preview */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <strong style={{ fontSize: 15 }}>{productos.length} productos listos</strong>
              {cambio && (
                <span style={{ fontSize: 12, color: '#6b7280', marginLeft: 8 }}>
                  · Cambio: 1 USD = {cambio.toLocaleString('es-PY', { maximumFractionDigits: 0 })} PYG · Margen: {margen}%
                </span>
              )}
            </div>
            <input
              type="text" placeholder="Buscar..." value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 13, width: 200 }}
            />
            <button
              onClick={() => { setPaso('idle'); setProductos([]) }}
              style={{ padding: '8px 16px', border: '1px solid #d1d5db', borderRadius: 8, background: '#fff', cursor: 'pointer', fontSize: 13 }}
            >
              Cancelar
            </button>
            <button
              onClick={importar}
              style={{ padding: '8px 20px', background: '#111827', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
            >
              ✅ Importar {productos.length} productos
            </button>
          </div>

          {/* Tabla */}
          <div style={{ overflowX: 'auto', maxHeight: 480, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead style={{ position: 'sticky', top: 0, background: '#f9fafb', zIndex: 1 }}>
                <tr>
                  {['Imagen','Nombre','SKU','Categoría','Precio USD','Precio PYG'].map(h => (
                    <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500, color: '#6b7280', fontSize: 12, borderBottom: '1px solid #e5e7eb', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.slice(0, 100).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '8px 12px' }}>
                      <img
                        src={p.imagen} alt="" width={40} height={40}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', display: 'block' }}
                        onError={e => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="40" height="40" fill="%23f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="18">📦</text></svg>' }}
                      />
                    </td>
                    <td style={{ padding: '8px 12px', maxWidth: 280 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nombre}</div>
                    </td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#6b7280', fontSize: 12 }}>{p.sku}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{p.categoria}</span>
                    </td>
                    <td style={{ padding: '8px 12px', fontWeight: 500 }}>U$ {p.precio_usd.toFixed(2)}</td>
                    <td style={{ padding: '8px 12px', color: '#059669', fontWeight: 500 }}>
                      {cambio ? formatPYG(p.precio_usd, cambio, margen) : '...'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {productosFiltrados.length > 100 && (
              <div style={{ padding: '12px 20px', textAlign: 'center', color: '#6b7280', fontSize: 13, borderTop: '1px solid #e5e7eb' }}>
                Mostrando 100 de {productosFiltrados.length} productos
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
