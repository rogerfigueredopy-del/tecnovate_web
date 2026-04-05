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

  const buildCount = Object.keys(build).length
  const buildPct = Math.round((buildCount / SLOTS.length) * 100)

  return (
    <div style={{ background: '#05050f', minHeight: '100vh', color: 'white' }}>
      <style>{`
        @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
        @keyframes neonPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes slotGlow { 0%,100%{box-shadow:0 0 8px rgba(139,92,246,.3)} 50%{box-shadow:0 0 22px rgba(139,92,246,.7),0 0 40px rgba(139,92,246,.2)} }
        @keyframes countUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .slot-card { transition: all .2s; }
        .slot-card:hover { transform: translateX(4px); }
        .slot-selected { animation: slotGlow 2.5s ease-in-out infinite; }
        .neon-btn { position:relative; overflow:hidden; transition: all .2s; }
        .neon-btn::before { content:''; position:absolute; top:0;left:-100%;width:100%;height:100%; background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent); transition:.4s; }
        .neon-btn:hover::before { left:100%; }
        .neon-btn:hover { transform:scale(1.03); }
        .scanline { position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(139,92,246,.15),transparent);animation:scanline 8s linear infinite;pointer-events:none;z-index:0; }
      `}</style>

      {/* Scanline overlay */}
      <div className="scanline" />

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(139,92,246,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(139,92,246,.04) 1px,transparent 1px)', backgroundSize: '40px 40px', zIndex: 0 }} />

      {/* ── HERO ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ background: 'linear-gradient(160deg,#0d0020 0%,#1a0040 50%,#0d0020 100%)', borderBottom: '1px solid rgba(139,92,246,.25)', zIndex: 1 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 100% at 50% 0%,rgba(139,92,246,.18),transparent)' }} />
        <div className="max-w-7xl mx-auto px-4 py-10 relative">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ background: 'rgba(139,92,246,.2)', border: '1px solid rgba(139,92,246,.4)', color: '#a78bfa', animation: 'neonPulse 2s infinite' }}>
                  CONFIGURADOR GAMER
                </span>
              </div>
              <h1 className="font-black uppercase" style={{ fontSize: 'clamp(28px,5vw,48px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
                <span style={{ color: 'white' }}>ARMÁ TU</span>{' '}
                <span style={{ background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PC GAMER</span>
              </h1>
              <p className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>
                Elegí cada pieza — compatibilidad verificada en tiempo real
              </p>
            </div>

            {/* Build progress HUD */}
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(139,92,246,.15)" strokeWidth="6" />
                    <circle cx="40" cy="40" r="34" fill="none" stroke="url(#progGrad)" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - buildPct / 100)}`}
                      strokeLinecap="round" style={{ transition: 'stroke-dashoffset .5s ease' }} />
                    <defs>
                      <linearGradient id="progGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#7c3aed" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-black text-sm" style={{ color: '#a78bfa' }}>{buildPct}%</span>
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,.4)' }}>{buildCount}/{SLOTS.length} piezas</p>
              </div>

              <div className="space-y-2">
                <button onClick={() => { setBuild({}); setCompat(null) }}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide transition-all hover:bg-white/10"
                  style={{ border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.5)' }}>
                  <Trash2 size={13} /> Reset
                </button>
                <button onClick={addAllToCart}
                  disabled={buildCount === 0}
                  className="neon-btn flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wide text-white disabled:opacity-30"
                  style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 20px rgba(124,58,237,.4)' }}>
                  <ShoppingCart size={13} /> Agregar ({buildCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6 relative" style={{ zIndex: 1 }}>

        {/* LEFT: Slots */}
        <div className="lg:col-span-2 space-y-3">

          {/* Compat banner */}
          {compat && compat.issues.length > 0 && (
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}>
              <AlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
              <div>{compat.issues.map((issue, i) => <p key={i} className="text-sm" style={{ color: '#f87171' }}>{issue}</p>)}</div>
            </div>
          )}
          {compat && compat.warnings.length > 0 && !compat.issues.length && (
            <div className="rounded-xl p-4 flex items-start gap-3" style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.25)' }}>
              <AlertTriangle size={16} style={{ color: '#fbbf24', flexShrink: 0, marginTop: 2 }} />
              <div>{compat.warnings.map((w, i) => <p key={i} className="text-sm" style={{ color: '#fbbf24' }}>{w}</p>)}</div>
            </div>
          )}
          {compat?.ok && buildCount >= 2 && (
            <div className="rounded-xl p-3 flex items-center gap-2" style={{ background: 'rgba(34,197,94,.07)', border: '1px solid rgba(34,197,94,.25)' }}>
              <CheckCircle size={15} style={{ color: '#4ade80' }} />
              <p className="text-sm font-bold" style={{ color: '#4ade80' }}>Build compatible — todos los componentes funcionan entre sí</p>
            </div>
          )}
          {recommendations.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.2)' }}>
              {recommendations.map((tip, i) => <p key={i} className="text-sm" style={{ color: '#c4b5fd' }}>{tip}</p>)}
            </div>
          )}

          {/* Slot cards */}
          {SLOTS.map((slot, idx) => {
            const selected = build[slot.key]
            const hasIssue = compat?.issues.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))
            const hasWarning = compat?.warnings.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))
            const borderColor = hasIssue ? 'rgba(239,68,68,.6)' : hasWarning ? 'rgba(251,191,36,.5)' : selected ? 'rgba(139,92,246,.7)' : 'rgba(255,255,255,.08)'
            const bgColor = hasIssue ? 'rgba(239,68,68,.04)' : selected ? 'rgba(139,92,246,.06)' : 'rgba(255,255,255,.02)'

            return (
              <div key={slot.key} className={`slot-card rounded-2xl overflow-hidden ${selected ? 'slot-selected' : ''}`}
                style={{ background: bgColor, border: `1px solid ${borderColor}` }}>

                {/* Slot number badge */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="shrink-0 flex flex-col items-center gap-1">
                    <span className="text-xs font-black" style={{ color: 'rgba(255,255,255,.2)', fontVariantNumeric: 'tabular-nums' }}>
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
                      style={{ background: selected ? 'rgba(139,92,246,.2)' : 'rgba(255,255,255,.05)', border: `1px solid ${selected ? 'rgba(139,92,246,.4)' : 'rgba(255,255,255,.08)'}` }}>
                      {slot.icon}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-xs font-black uppercase tracking-widest" style={{ color: selected ? '#a78bfa' : 'rgba(255,255,255,.35)', fontSize: '10px' }}>
                        {slot.label}{slot.required && <span style={{ color: '#ec4899' }}> ★</span>}
                      </p>
                      {hasIssue && <AlertTriangle size={11} style={{ color: '#f87171' }} />}
                      {!hasIssue && hasWarning && <AlertTriangle size={11} style={{ color: '#fbbf24' }} />}
                      {selected && !hasIssue && !hasWarning && <CheckCircle size={11} style={{ color: '#4ade80' }} />}
                    </div>

                    {selected ? (
                      <div className="flex items-center gap-3">
                        {selected.images?.[0] && (
                          <div className="w-10 h-10 rounded-lg shrink-0 overflow-hidden flex items-center justify-center"
                            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                            <img src={selected.images[0]} alt="" className="w-full h-full object-contain p-1" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate text-white">{selected.name}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,.4)' }}>
                            {selected.brand}
                            {slot.key === 'CPU' && extractSocket(selected.name) && ` · Socket ${extractSocket(selected.name)}`}
                            {slot.key === 'MOTHERBOARD' && extractSocket(selected.name) && ` · Socket ${extractSocket(selected.name)}`}
                            {slot.key === 'RAM' && extractRAMType(selected.name) && ` · ${extractRAMType(selected.name)}`}
                            {slot.key === 'PSU' && extractPSUWatt(selected.name) > 0 && ` · ${extractPSUWatt(selected.name)}W`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>{slot.tip}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {selected && (
                      <p className="font-black text-base" style={{ color: '#c084fc', animation: 'countUp .3s ease' }}>
                        {formatPrice(selected.price)}
                      </p>
                    )}
                    <button onClick={() => openSlotModal(slot.key)}
                      className="neon-btn px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wide"
                      style={selected
                        ? { background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.6)' }
                        : { background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', boxShadow: '0 0 12px rgba(124,58,237,.4)' }}>
                      {selected ? 'Cambiar' : 'Elegir'}
                    </button>
                    {selected && (
                      <button onClick={() => removeSlot(slot.key)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-500/20">
                        <X size={14} style={{ color: 'rgba(255,255,255,.4)' }} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* RIGHT: HUD Panel */}
        <div className="space-y-4">

          {/* Price HUD */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(139,92,246,.25)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,.3)' }}>PRECIO TOTAL DEL BUILD</p>
            <p className="font-black" style={{ fontSize: 'clamp(22px,4vw,32px)', background: 'linear-gradient(135deg,#a78bfa,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'countUp .3s ease' }}>
              {formatPrice(totalPrice)}
            </p>

            {/* Slot breakdown */}
            <div className="mt-4 space-y-2">
              {SLOTS.map(slot => {
                const comp = build[slot.key]
                return (
                  <div key={slot.key} className="flex items-center justify-between py-1" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: 13 }}>{slot.icon}</span>
                      <p className="text-xs" style={{ color: comp ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.2)' }}>{slot.label}</p>
                    </div>
                    <p className="text-xs font-bold" style={{ color: comp ? '#c084fc' : 'rgba(255,255,255,.2)' }}>
                      {comp ? formatPrice(comp.price) : '—'}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Power meter */}
            {totalWatt > 0 && (
              <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-black uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.3)' }}>ENERGÍA</p>
                  <p className="text-xs font-black" style={{ color: totalWatt > (psuWatt * 0.85) ? '#f87171' : '#4ade80' }}>{totalWatt}W</p>
                </div>
                {psuWatt > 0 && (
                  <>
                    <div className="rounded-full h-2 overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((totalWatt / psuWatt) * 100, 100)}%`,
                          background: totalWatt > psuWatt * 0.85 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : totalWatt > psuWatt * 0.7 ? 'linear-gradient(90deg,#f59e0b,#fbbf24)' : 'linear-gradient(90deg,#22c55e,#4ade80)',
                          boxShadow: `0 0 8px ${totalWatt > psuWatt * 0.85 ? '#ef4444' : totalWatt > psuWatt * 0.7 ? '#f59e0b' : '#22c55e'}`,
                        }} />
                    </div>
                    <p className="text-xs mt-1.5" style={{ color: 'rgba(255,255,255,.3)' }}>
                      {psuWatt}W fuente · {psuWatt - totalWatt > 0 ? `+${psuWatt - totalWatt}W margen` : '⚠ Sin margen'}
                    </p>
                  </>
                )}
              </div>
            )}

            <button onClick={addAllToCart} disabled={buildCount === 0}
              className="neon-btn w-full mt-4 py-3.5 rounded-xl font-black text-sm uppercase tracking-wide text-white flex items-center justify-center gap-2 disabled:opacity-30"
              style={{ background: 'linear-gradient(135deg,#7c3aed,#ec4899)', boxShadow: '0 0 24px rgba(124,58,237,.4)' }}>
              <ShoppingCart size={16} />
              Agregar todo al carrito
            </button>
          </div>

          {/* Presupuesto guide */}
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.02)', border: '1px solid rgba(255,255,255,.07)' }}>
            <p className="text-xs font-black uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,.3)' }}>GUÍA DE PRESUPUESTO</p>
            {[
              { label: 'BÁSICA', budget: 'Gs. 8M–12M', desc: 'Ryzen 5 · 16GB DDR5 · RTX 4060', color: '#4ade80', glow: '#22c55e' },
              { label: 'MEDIA',  budget: 'Gs. 12M–20M', desc: 'Ryzen 7 · 32GB DDR5 · RTX 4070', color: '#60a5fa', glow: '#3b82f6' },
              { label: 'PRO',    budget: 'Gs. 20M–35M', desc: 'Ryzen 9 · 32GB DDR5 · RTX 4080', color: '#c084fc', glow: '#a855f7' },
            ].map(p => (
              <div key={p.label} className="flex items-start gap-3 mb-4 last:mb-0">
                <div className="w-1.5 rounded-full shrink-0 mt-1" style={{ height: 36, background: p.color, boxShadow: `0 0 8px ${p.glow}` }} />
                <div>
                  <p className="text-xs font-black" style={{ color: p.color }}>{p.label} · {p.budget}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.35)' }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── MODAL ─────────────────────────────────────────── */}
      {openSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,.8)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpenSlot(null) }}>

          <div className="w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col rounded-2xl"
            style={{ background: '#0e0e1a', border: '1px solid rgba(139,92,246,.35)', boxShadow: '0 0 60px rgba(124,58,237,.25)' }}>

            {/* Modal header */}
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
              <div>
                <div className="flex items-center gap-2">
                  <span style={{ fontSize: 20 }}>{SLOTS.find(s => s.key === openSlot)?.icon}</span>
                  <h3 className="font-black text-base uppercase tracking-wide text-white">
                    {SLOTS.find(s => s.key === openSlot)?.label}
                  </h3>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,.3)' }}>
                  {filteredComponents.length} opciones disponibles
                </p>
              </div>
              <button onClick={() => setOpenSlot(null)}
                className="p-2 rounded-lg transition-colors hover:bg-white/10">
                <X size={18} style={{ color: 'rgba(255,255,255,.5)' }} />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,.05)' }}>
              <div className="flex items-center gap-2 rounded-xl px-4 py-2.5"
                style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)' }}>
                <Search size={15} style={{ color: 'rgba(255,255,255,.4)' }} />
                <input autoFocus value={searchComp} onChange={e => setSearchComp(e.target.value)}
                  placeholder="Buscar por nombre o marca..."
                  className="flex-1 bg-transparent outline-none text-sm text-white placeholder:text-white/30" />
              </div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-4 space-y-2">
              {loadingComps ? (
                <div className="text-center py-16">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,.3)' }}>Cargando componentes...</p>
                </div>
              ) : filteredComponents.length === 0 ? (
                <div className="text-center py-16" style={{ color: 'rgba(255,255,255,.3)' }}>Sin resultados</div>
              ) : filteredComponents.map(comp => {
                const isSelected = build[openSlot!]?.id === comp.id
                const hint = getCompatHint(comp)
                return (
                  <div key={comp.id} onClick={() => selectComponent(comp)}
                    className="flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all"
                    style={{
                      background: isSelected ? 'rgba(139,92,246,.15)' : 'rgba(255,255,255,.02)',
                      border: isSelected ? '1.5px solid rgba(139,92,246,.6)' : '1px solid rgba(255,255,255,.07)',
                    }}
                    onMouseEnter={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(139,92,246,.35)' }}
                    onMouseLeave={e => { if (!isSelected) (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,.07)' }}>

                    <div className="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center overflow-hidden"
                      style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
                      {comp.images?.[0]
                        ? <img src={comp.images[0]} alt="" className="w-full h-full object-contain p-1" />
                        : <span className="text-2xl">{SLOTS.find(s => s.key === openSlot)?.icon}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold mb-0.5" style={{ color: '#a78bfa' }}>{comp.brand}</p>
                      <p className="text-sm font-semibold text-white leading-snug">{comp.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {hint && (
                          <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                            style={{ background: hint.ok ? 'rgba(34,197,94,.15)' : 'rgba(239,68,68,.15)', color: hint.ok ? '#4ade80' : '#f87171', fontSize: '10px' }}>
                            {hint.ok ? '✓ Compatible' : '✗ Incompatible'}
                          </span>
                        )}
                        {(openSlot === 'CPU' || openSlot === 'MOTHERBOARD') && extractSocket(comp.name) && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)', fontSize: '10px' }}>
                            {extractSocket(comp.name)}
                          </span>
                        )}
                        {openSlot === 'PSU' && extractPSUWatt(comp.name) > 0 && (
                          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,.07)', color: 'rgba(255,255,255,.4)', fontSize: '10px' }}>
                            {extractPSUWatt(comp.name)}W
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {comp.oldPrice && comp.oldPrice > comp.price && (
                        <p className="text-xs line-through" style={{ color: 'rgba(255,255,255,.25)' }}>{formatPrice(comp.oldPrice)}</p>
                      )}
                      <p className="font-black text-base" style={{ color: '#c084fc' }}>{formatPrice(comp.price)}</p>
                      {isSelected && (
                        <span className="text-xs px-2 py-0.5 rounded-full font-black" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', fontSize: '10px' }}>
                          SELECCIONADO
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
