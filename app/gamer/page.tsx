'use client'
import { useState, useEffect, useCallback } from 'react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import Image from 'next/image'
import {
  X, Search, ShoppingCart, Trash2, CheckCircle,
  AlertTriangle, Info, Zap, ChevronRight, Star,
  Cpu, HardDrive, Server, Monitor, Battery, Box, Wind, MemoryStick
} from 'lucide-react'

// ── Slot definitions ─────────────────────────────────────────────────────────
const SLOTS = [
  { key: 'CPU', label: 'Procesador', icon: '⚙️', required: true, tip: 'El cerebro de tu PC. AMD Ryzen o Intel Core.' },
  { key: 'MOTHERBOARD', label: 'Placa Madre', icon: '🟫', required: true, tip: 'Debe ser compatible con el socket de tu CPU.' },
  { key: 'RAM', label: 'Memoria RAM', icon: '🔧', required: true, tip: 'Mínimo 16GB DDR5 para gaming moderno.' },
  { key: 'GPU', label: 'Tarjeta Gráfica', icon: '🎮', required: true, tip: 'La GPU define el rendimiento en juegos.' },
  { key: 'STORAGE', label: 'Almacenamiento', icon: '💾', required: true, tip: 'SSD NVMe para máxima velocidad de carga.' },
  { key: 'PSU', label: 'Fuente de Poder', icon: '⚡', required: true, tip: 'Debe tener margen extra sobre el consumo total.' },
  { key: 'CASE', label: 'Gabinete', icon: '🏠', required: false, tip: 'Considerá el tamaño (ATX, mATX, ITX).' },
  { key: 'COOLING', label: 'Enfriamiento', icon: '❄️', required: false, tip: 'Liquid cooling para overclocking, air para uso normal.' },
]

// ── Compatibility rules ───────────────────────────────────────────────────────
function checkCompatibility(build: Record<string, any>): { ok: boolean; issues: string[]; warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []

  const cpu = build['CPU']
  const mb = build['MOTHERBOARD']
  const ram = build['RAM']
  const gpu = build['GPU']
  const psu = build['PSU']
  const cooling = build['COOLING']

  // CPU ↔ Motherboard socket
  if (cpu && mb) {
    const cpuSocket = extractSocket(cpu.name)
    const mbSocket = extractSocket(mb.name)
    if (cpuSocket && mbSocket && cpuSocket !== mbSocket) {
      issues.push(`❌ CPU (${cpuSocket}) no es compatible con la Motherboard (${mbSocket}). Necesitás una placa ${cpuSocket}.`)
    } else if (cpuSocket && mbSocket && cpuSocket === mbSocket) {
      // ok
    }
  }

  // RAM type check
  if (ram && mb) {
    const ramDDR = extractRAMType(ram.name)
    const mbDDR = extractRAMType(mb.name)
    if (ramDDR && mbDDR && ramDDR !== mbDDR) {
      issues.push(`❌ La RAM (${ramDDR}) no es compatible con la Motherboard (${mbDDR}).`)
    }
  }

  // Power consumption vs PSU
  if (psu) {
    const totalWatt = calcTotalWatt(build)
    const psuWatt = extractPSUWatt(psu.name)
    if (psuWatt > 0) {
      const usage = (totalWatt / psuWatt) * 100
      if (totalWatt > psuWatt * 0.85) {
        issues.push(`❌ La fuente de ${psuWatt}W puede ser insuficiente. Consumo estimado: ${totalWatt}W (${Math.round(usage)}%).`)
      } else if (totalWatt > psuWatt * 0.7) {
        warnings.push(`⚠ La fuente de ${psuWatt}W tiene poco margen. Consumo estimado: ${totalWatt}W (${Math.round(usage)}%). Recomendamos al menos 20% de margen.`)
      }
    }
  }

  // Cooling for high-end CPUs
  if (cpu && !cooling) {
    const cpuName = cpu.name.toLowerCase()
    if (cpuName.includes('ryzen 9') || cpuName.includes('core ultra 9') || cpuName.includes('i9') || cpuName.includes('i7')) {
      warnings.push(`⚠ Con este procesador se recomienda un sistema de enfriamiento adicional (especialmente líquido) para máximo rendimiento.`)
    }
  }

  return { ok: issues.length === 0, issues, warnings }
}

function extractSocket(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes('am5')) return 'AM5'
  if (n.includes('am4')) return 'AM4'
  if (n.includes('lga1700') || n.includes('lga 1700')) return 'LGA1700'
  if (n.includes('lga1851') || n.includes('lga 1851')) return 'LGA1851'
  if (n.includes('1700') && (n.includes('placa') || n.includes('procesador') || n.includes('core i'))) return 'LGA1700'
  return null
}

function extractRAMType(name: string): string | null {
  const n = name.toLowerCase()
  if (n.includes('ddr5')) return 'DDR5'
  if (n.includes('ddr4')) return 'DDR4'
  if (n.includes('ddr3')) return 'DDR3'
  return null
}

function extractPSUWatt(name: string): number {
  const match = name.match(/(\d{3,4})\s*w/i)
  return match ? parseInt(match[1]) : 0
}

function calcTotalWatt(build: Record<string, any>): number {
  const wattMap: Record<string, number> = {
    CPU: 0, MOTHERBOARD: 30, RAM: 8, GPU: 0, STORAGE: 6, PSU: 0, CASE: 5, COOLING: 8,
  }
  let total = 0
  for (const [slot, comp] of Object.entries(build)) {
    if (!comp) continue
    const n = comp.name.toLowerCase()
    if (slot === 'GPU') {
      if (n.includes('rtx 4090') || n.includes('rtx 5090')) total += 450
      else if (n.includes('rtx 4080') || n.includes('rtx 5080')) total += 320
      else if (n.includes('rtx 4070') || n.includes('rtx 5070')) total += 250
      else if (n.includes('rtx 4060') || n.includes('rtx 5060')) total += 165
      else if (n.includes('rx 7900')) total += 330
      else if (n.includes('rx 7800')) total += 260
      else total += 180
    } else if (slot === 'CPU') {
      if (n.includes('ryzen 9') || n.includes('core ultra 9') || n.includes('i9')) total += 125
      else if (n.includes('ryzen 7') || n.includes('core ultra 7') || n.includes('i7')) total += 105
      else if (n.includes('ryzen 5') || n.includes('core ultra 5') || n.includes('i5')) total += 65
      else total += 65
    } else {
      total += wattMap[slot] || 0
    }
  }
  return total
}

// ── Recommendations ───────────────────────────────────────────────────────────
function getRecommendations(build: Record<string, any>, allComponents: Record<string, any[]>): string[] {
  const tips: string[] = []
  const cpu = build['CPU']
  const mb = build['MOTHERBOARD']
  const gpu = build['GPU']
  const ram = build['RAM']

  if (cpu && !mb) {
    const socket = extractSocket(cpu.name)
    if (socket) tips.push(`💡 Tu CPU requiere una Motherboard con socket ${socket}. Filtramos las opciones compatibles automáticamente.`)
  }
  if (!gpu) {
    const total = Object.keys(build).length
    if (total >= 3) tips.push(`💡 Agregá una Tarjeta Gráfica para completar tu build gamer. Para 1080p gaming moderado: RTX 4060. Para 1440p: RTX 4070.`)
  }
  if (!ram && cpu) {
    const cpuName = cpu.name.toLowerCase()
    if (cpuName.includes('am5') || cpuName.includes('ryzen 7') || cpuName.includes('ryzen 9')) {
      tips.push(`💡 Con este procesador se recomienda DDR5 para máximo rendimiento.`)
    }
  }
  if (gpu && !build['PSU']) {
    const gpuName = gpu.name.toLowerCase()
    let suggestedPSU = 650
    if (gpuName.includes('rtx 4090') || gpuName.includes('rtx 5090')) suggestedPSU = 1000
    else if (gpuName.includes('rtx 4080') || gpuName.includes('rtx 5080')) suggestedPSU = 850
    else if (gpuName.includes('rtx 4070') || gpuName.includes('rtx 5070')) suggestedPSU = 750
    tips.push(`💡 Con esta GPU se recomienda una fuente de al menos ${suggestedPSU}W 80+ Gold para estabilidad.`)
  }
  return tips.slice(0, 2)
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function GamerPage() {
  const [build, setBuild] = useState<Record<string, any>>({})
  const [openSlot, setOpenSlot] = useState<string | null>(null)
  const [components, setComponents] = useState<any[]>([])
  const [allComponents, setAllComponents] = useState<Record<string, any[]>>({})
  const [loadingComps, setLoadingComps] = useState(false)
  const [searchComp, setSearchComp] = useState('')
  const [compat, setCompat] = useState<{ ok: boolean; issues: string[]; warnings: string[] } | null>(null)
  const addItem = useCartStore(s => s.addItem)

  // Recalculate compatibility whenever build changes
  useEffect(() => {
    if (Object.keys(build).length >= 2) {
      setCompat(checkCompatibility(build))
    } else {
      setCompat(null)
    }
  }, [build])

  // Load components for a slot
  const openSlotModal = async (slotKey: string) => {
    setOpenSlot(slotKey)
    setSearchComp('')
    if (allComponents[slotKey]) {
      setComponents(allComponents[slotKey])
      return
    }
    setLoadingComps(true)
    try {
      const res = await fetch(`/api/products?limit=100&${slotKey === 'GPU' ? 'q=tarjeta+gr' : slotKey === 'CPU' ? 'q=procesador' : slotKey === 'MOTHERBOARD' ? 'q=placa+madre' : slotKey === 'RAM' ? 'q=memoria+ram' : slotKey === 'STORAGE' ? 'q=ssd' : slotKey === 'PSU' ? 'q=fuente+de+alimentacion' : slotKey === 'CASE' ? 'q=gabinete' : slotKey === 'COOLING' ? 'q=cooler' : ''}`)
      const data = await res.json()
      const items = data.products || []
      setComponents(items)
      setAllComponents(prev => ({ ...prev, [slotKey]: items }))
    } catch {
      setComponents([])
    } finally {
      setLoadingComps(false)
    }
  }

  const selectComponent = (comp: any) => {
    setBuild(b => ({ ...b, [openSlot!]: comp }))
    setOpenSlot(null)
    toast.success(`✓ ${comp.name.substring(0, 40)}... seleccionado`)
  }

  const removeSlot = (slot: string) => {
    setBuild(b => { const n = { ...b }; delete n[slot]; return n })
  }

  const totalPrice = Object.values(build).reduce((s: number, c: any) => s + (c?.price || 0), 0)
  const totalWatt = calcTotalWatt(build)
  const psuWatt = build['PSU'] ? extractPSUWatt(build['PSU'].name) : 0
  const recommendations = getRecommendations(build, allComponents)

  const addAllToCart = () => {
    const items = Object.values(build)
    if (!items.length) { toast.error('Agregá al menos un componente'); return }
    items.forEach((comp: any) => {
      addItem({ id: comp.id, name: comp.name, brand: comp.brand || 'Genérico', price: comp.price, image: comp.images?.[0] || '', slug: comp.slug || comp.id })
    })
    toast.success(`🛒 ${items.length} componentes agregados al carrito!`)
  }

  const filteredComponents = components.filter(c =>
    !searchComp || c.name.toLowerCase().includes(searchComp.toLowerCase()) || (c.brand || '').toLowerCase().includes(searchComp.toLowerCase())
  )

  // Get compatibility hint for a specific component in the open slot
  const getCompatHint = (comp: any) => {
    if (!openSlot) return null
    const tempBuild = { ...build, [openSlot]: comp }
    const result = checkCompatibility(tempBuild)
    if (result.issues.some(i => i.includes(openSlot!) || (openSlot === 'CPU' && i.includes('CPU')) || (openSlot === 'MOTHERBOARD' && i.includes('Motherboard')))) {
      return { ok: false, msg: 'Incompatible con tu build actual' }
    }
    return { ok: true, msg: 'Compatible' }
  }

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      {/* Header */}
      <div className="bg-white border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-900 mb-1" style={{ fontWeight: 900, color: 'var(--text-primary)' }}>
                ⚡ Armá tu PC
              </h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                Seleccioná cada componente — verificamos compatibilidad en tiempo real
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setBuild({}); setCompat(null) }}
                className="px-4 py-2 rounded-lg border text-sm font-600"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', fontWeight: 600 }}
              >
                Limpiar build
              </button>
              <button
                onClick={addAllToCart}
                className="px-5 py-2 rounded-lg text-white text-sm font-700 flex items-center gap-2"
                style={{ background: 'var(--accent)', fontWeight: 700 }}
              >
                <ShoppingCart size={16} />
                Agregar todo ({Object.keys(build).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Component slots */}
        <div className="lg:col-span-2 space-y-3">

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: '#faf0fb', border: '1px solid var(--accent-bg2)' }}>
              <p className="text-sm font-700 mb-2" style={{ color: 'var(--accent)', fontWeight: 700 }}>
                💡 Recomendaciones para tu build
              </p>
              {recommendations.map((tip, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>{tip}</p>
              ))}
            </div>
          )}

          {/* Compatibility alerts */}
          {compat && (compat.issues.length > 0 || compat.warnings.length > 0) && (
            <div className="rounded-xl p-4" style={{
              background: compat.issues.length > 0 ? '#fff5f5' : '#fffbeb',
              border: `1px solid ${compat.issues.length > 0 ? '#fecaca' : '#fde68a'}`
            }}>
              {compat.issues.map((issue, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: '#dc2626' }}>{issue}</p>
              ))}
              {compat.warnings.map((w, i) => (
                <p key={i} className="text-sm mb-1" style={{ color: '#d97706' }}>{w}</p>
              ))}
            </div>
          )}

          {compat?.ok && Object.keys(build).length >= 2 && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
              <CheckCircle size={16} style={{ color: '#16a34a' }} />
              <p className="text-sm font-600" style={{ color: '#16a34a', fontWeight: 600 }}>
                ✓ Todos los componentes son compatibles entre sí
              </p>
            </div>
          )}

          {/* Slot list */}
          {SLOTS.map(slot => {
            const selected = build[slot.key]
            const hasIssue = compat?.issues.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))
            const hasWarning = compat?.warnings.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))

            return (
              <div
                key={slot.key}
                className="bg-white rounded-xl overflow-hidden transition-all"
                style={{
                  border: hasIssue ? '1.5px solid #fca5a5' : hasWarning ? '1.5px solid #fde68a' : selected ? '1.5px solid #bbf7d0' : '1px solid var(--border)',
                  boxShadow: 'var(--shadow)',
                }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Slot icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                    style={{ background: selected ? '#faf0fb' : 'var(--bg-secondary)' }}
                  >
                    {slot.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-xs font-700 uppercase tracking-wide" style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '11px' }}>
                        {slot.label}
                        {slot.required && <span style={{ color: 'var(--accent)' }}> *</span>}
                      </p>
                      {hasIssue && <AlertTriangle size={12} style={{ color: '#dc2626' }} />}
                      {hasWarning && !hasIssue && <AlertTriangle size={12} style={{ color: '#d97706' }} />}
                      {selected && !hasIssue && !hasWarning && <CheckCircle size={12} style={{ color: '#16a34a' }} />}
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-3">
                        {selected.images?.[0] && (
                          <div className="w-10 h-10 shrink-0">
                            <img src={selected.images[0]} alt="" className="w-full h-full object-contain" style={{ borderRadius: '6px' }} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-600 text-sm truncate" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                            {selected.name}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                            {selected.brand}
                            {slot.key === 'CPU' && extractSocket(selected.name) && ` · Socket ${extractSocket(selected.name)}`}
                            {slot.key === 'MOTHERBOARD' && extractSocket(selected.name) && ` · Socket ${extractSocket(selected.name)}`}
                            {slot.key === 'RAM' && extractRAMType(selected.name) && ` · ${extractRAMType(selected.name)}`}
                            {slot.key === 'PSU' && extractPSUWatt(selected.name) > 0 && ` · ${extractPSUWatt(selected.name)}W`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {slot.tip}
                      </p>
                    )}
                  </div>

                  {/* Price + actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    {selected && (
                      <p className="font-800 text-base" style={{ color: 'var(--accent)', fontWeight: 800 }}>
                        {formatPrice(selected.price)}
                      </p>
                    )}
                    <button
                      onClick={() => openSlotModal(slot.key)}
                      className="px-4 py-2 rounded-lg text-sm font-600 transition-all"
                      style={{
                        background: selected ? 'var(--bg-secondary)' : 'var(--accent)',
                        color: selected ? 'var(--text-secondary)' : 'white',
                        fontWeight: 600,
                        border: selected ? '1px solid var(--border)' : 'none',
                      }}
                    >
                      {selected ? 'Cambiar' : 'Elegir'}
                    </button>
                    {selected && (
                      <button onClick={() => removeSlot(slot.key)} className="p-2 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={15} style={{ color: '#dc2626' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: Summary panel */}
        <div className="space-y-4">
          {/* Build summary */}
          <div className="bg-white rounded-xl p-5" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 className="font-800 mb-4" style={{ fontWeight: 800, borderLeft: '3px solid var(--accent)', paddingLeft: '10px' }}>
              Resumen del Build
            </h3>

            <div className="space-y-2 mb-4">
              {SLOTS.map(slot => {
                const comp = build[slot.key]
                return (
                  <div key={slot.key} className="flex justify-between items-start text-sm py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="flex items-center gap-2">
                      <span>{slot.icon}</span>
                      <div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{slot.label}</p>
                        {comp && <p className="font-500 text-xs truncate max-w-32" style={{ color: 'var(--text-primary)' }}>{comp.name.substring(0, 35)}...</p>}
                      </div>
                    </div>
                    <p className="font-600 text-xs ml-2 shrink-0" style={{ color: comp ? 'var(--accent)' : 'var(--text-muted)', fontWeight: comp ? 700 : 400 }}>
                      {comp ? formatPrice(comp.price) : '—'}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Power */}
            {totalWatt > 0 && (
              <div className="rounded-xl p-3 mb-4" style={{ background: 'var(--bg-secondary)' }}>
                <div className="flex justify-between text-sm mb-2">
                  <span style={{ color: 'var(--text-secondary)' }}>⚡ Consumo estimado</span>
                  <span className="font-700" style={{ fontWeight: 700 }}>{totalWatt}W</span>
                </div>
                {psuWatt > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span style={{ color: 'var(--text-secondary)' }}>Fuente seleccionada</span>
                      <span className="font-700" style={{ fontWeight: 700 }}>{psuWatt}W</span>
                    </div>
                    <div className="rounded-full h-2 overflow-hidden" style={{ background: 'var(--border)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((totalWatt / psuWatt) * 100, 100)}%`,
                          background: totalWatt > psuWatt * 0.85 ? '#dc2626' : totalWatt > psuWatt * 0.7 ? '#f59e0b' : '#16a34a',
                        }}
                      />
                    </div>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                      {psuWatt - totalWatt > 0 ? `+${psuWatt - totalWatt}W de margen (${Math.round(((psuWatt - totalWatt) / psuWatt) * 100)}%)` : '⚠ Sin margen suficiente'}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Total */}
            <div className="flex justify-between items-center py-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <span className="font-700" style={{ fontWeight: 700 }}>Total</span>
              <span className="text-xl font-900" style={{ color: 'var(--accent)', fontWeight: 900 }}>
                {formatPrice(totalPrice)}
              </span>
            </div>

            <button
              onClick={addAllToCart}
              disabled={Object.keys(build).length === 0}
              className="w-full py-3 rounded-xl text-white font-700 flex items-center justify-center gap-2 mt-2 disabled:opacity-40"
              style={{ background: 'var(--accent)', fontWeight: 700 }}
            >
              <ShoppingCart size={18} />
              Agregar todo al carrito
            </button>
          </div>

          {/* Compatibility status */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 className="font-700 text-sm mb-3" style={{ fontWeight: 700 }}>Estado de Compatibilidad</h3>
            {Object.keys(build).length < 2 ? (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Seleccioná al menos 2 componentes para ver la compatibilidad.</p>
            ) : compat?.ok ? (
              <div className="flex items-center gap-2">
                <CheckCircle size={20} style={{ color: '#16a34a' }} />
                <p className="text-sm font-600" style={{ color: '#16a34a', fontWeight: 600 }}>✓ Build compatible</p>
              </div>
            ) : (
              <div>
                {compat?.issues.map((issue, i) => (
                  <div key={i} className="flex items-start gap-2 mb-2">
                    <AlertTriangle size={16} style={{ color: '#dc2626', marginTop: '2px', flexShrink: 0 }} />
                    <p className="text-xs" style={{ color: '#dc2626' }}>{issue}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick presets */}
          <div className="bg-white rounded-xl p-4" style={{ border: '1px solid var(--border)', boxShadow: 'var(--shadow)' }}>
            <h3 className="font-700 text-sm mb-3" style={{ fontWeight: 700 }}>💡 Guía de presupuesto</h3>
            {[
              { label: 'PC Básica', budget: 'Gs. 8M - 12M', desc: 'Ryzen 5 + 16GB DDR5 + RTX 4060', color: '#16a34a' },
              { label: 'PC Media', budget: 'Gs. 12M - 20M', desc: 'Ryzen 7 + 32GB DDR5 + RTX 4070', color: '#2563eb' },
              { label: 'PC Gamer Pro', budget: 'Gs. 20M - 35M', desc: 'Ryzen 9 + 32GB DDR5 + RTX 4080', color: '#b769bd' },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-3 mb-3 last:mb-0">
                <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: p.color }} />
                <div>
                  <p className="text-sm font-700" style={{ fontWeight: 700, color: p.color }}>{p.label} · {p.budget}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component selector modal */}
      {openSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpenSlot(null) }}
        >
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>
            {/* Modal header */}
            <div className="p-5 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h3 className="font-800 text-lg" style={{ fontWeight: 800 }}>
                  {SLOTS.find(s => s.key === openSlot)?.icon} {' '}
                  Seleccionar {SLOTS.find(s => s.key === openSlot)?.label}
                </h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  {filteredComponents.length} productos disponibles
                </p>
              </div>
              <button onClick={() => setOpenSlot(null)} className="p-2 rounded-lg hover:bg-gray-50">
                <X size={20} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2.5" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                <Search size={16} style={{ color: 'var(--text-muted)' }} />
                <input
                  autoFocus
                  value={searchComp}
                  onChange={e => setSearchComp(e.target.value)}
                  placeholder="Buscar por nombre o marca..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            {/* Component list */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loadingComps ? (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  Cargando componentes...
                </div>
              ) : filteredComponents.length === 0 ? (
                <div className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                  No se encontraron componentes
                </div>
              ) : (
                filteredComponents.map(comp => {
                  const isSelected = build[openSlot!]?.id === comp.id
                  const hint = getCompatHint(comp)

                  return (
                    <div
                      key={comp.id}
                      onClick={() => selectComponent(comp)}
                      className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
                      style={{
                        border: isSelected ? `2px solid var(--accent)` : '1px solid var(--border)',
                        background: isSelected ? 'var(--accent-bg)' : 'white',
                      }}
                      onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--accent-light)' }}
                      onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg shrink-0 overflow-hidden flex items-center justify-center" style={{ background: 'var(--bg-secondary)' }}>
                        {comp.images?.[0] ? (
                          <img src={comp.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        ) : (
                          <span className="text-2xl">{SLOTS.find(s => s.key === openSlot)?.icon}</span>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-700 mb-0.5" style={{ color: 'var(--accent)', fontWeight: 700 }}>{comp.brand}</p>
                        <p className="text-sm font-500 leading-tight" style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {comp.name}
                        </p>
                        <div className="flex items-center gap-3 mt-1">
                          {hint && (
                            <span
                              className="text-xs px-2 py-0.5 rounded"
                              style={{
                                background: hint.ok ? '#f0fdf4' : '#fff5f5',
                                color: hint.ok ? '#16a34a' : '#dc2626',
                                fontSize: '11px',
                              }}
                            >
                              {hint.ok ? '✓ Compatible' : '✗ Incompatible'}
                            </span>
                          )}
                          {openSlot === 'CPU' && extractSocket(comp.name) && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '11px' }}>
                              Socket {extractSocket(comp.name)}
                            </span>
                          )}
                          {openSlot === 'MOTHERBOARD' && extractSocket(comp.name) && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '11px' }}>
                              Socket {extractSocket(comp.name)}
                            </span>
                          )}
                          {openSlot === 'PSU' && extractPSUWatt(comp.name) > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', fontSize: '11px' }}>
                              {extractPSUWatt(comp.name)}W
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0">
                        {comp.oldPrice && comp.oldPrice > comp.price && (
                          <p className="text-xs line-through" style={{ color: 'var(--text-muted)' }}>
                            {formatPrice(comp.oldPrice)}
                          </p>
                        )}
                        <p className="font-800 text-base" style={{ color: 'var(--accent)', fontWeight: 800 }}>
                          {formatPrice(comp.price)}
                        </p>
                        {isSelected && (
                          <span className="text-xs text-white px-2 py-0.5 rounded-full" style={{ background: 'var(--accent)', fontSize: '10px' }}>
                            Seleccionado
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
