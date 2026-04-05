'use client'
import { useState, useEffect, useRef } from 'react'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import toast from 'react-hot-toast'
import {
  X, Search, ShoppingCart, Trash2, CheckCircle,
  AlertTriangle,
  Cpu, HardDrive, Server, Monitor, Battery, Box, Wind, MemoryStick
} from 'lucide-react'

// ── Slot definitions ──────────────────────────────────────────────────────────
const SLOTS = [
  { key: 'CPU',         label: 'Procesador',      icon: '⚙️',  required: true,  tip: 'El cerebro de tu PC. AMD Ryzen o Intel Core.' },
  { key: 'MOTHERBOARD', label: 'Placa Madre',      icon: '🟫',  required: true,  tip: 'Debe ser compatible con el socket de tu CPU.' },
  { key: 'RAM',         label: 'Memoria RAM',      icon: '🔧',  required: true,  tip: 'Mínimo 16GB DDR5 para gaming moderno.' },
  { key: 'GPU',         label: 'Tarjeta Gráfica',  icon: '🎮',  required: true,  tip: 'La GPU define el rendimiento en juegos.' },
  { key: 'STORAGE',     label: 'Almacenamiento',   icon: '💾',  required: true,  tip: 'SSD NVMe para máxima velocidad de carga.' },
  { key: 'PSU',         label: 'Fuente de Poder',  icon: '⚡',  required: true,  tip: 'Debe tener margen extra sobre el consumo total.' },
  { key: 'CASE',        label: 'Gabinete',         icon: '🏠',  required: false, tip: 'Considerá el tamaño (ATX, mATX, ITX).' },
  { key: 'COOLING',     label: 'Enfriamiento',     icon: '❄️',  required: false, tip: 'Liquid cooling para overclocking, air para uso normal.' },
]

const SLOT_ICONS: Record<string, any> = {
  CPU: Cpu, MOTHERBOARD: Server, RAM: MemoryStick, GPU: Monitor,
  STORAGE: HardDrive, PSU: Battery, CASE: Box, COOLING: Wind,
}

// ── Compatibility helpers ─────────────────────────────────────────────────────
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
  const wattMap: Record<string, number> = { CPU: 0, MOTHERBOARD: 30, RAM: 8, GPU: 0, STORAGE: 6, PSU: 0, CASE: 5, COOLING: 8 }
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
      else total += 65
    } else {
      total += wattMap[slot] || 0
    }
  }
  return total
}
function checkCompatibility(build: Record<string, any>): { ok: boolean; issues: string[]; warnings: string[] } {
  const issues: string[] = []
  const warnings: string[] = []
  const cpu = build['CPU'], mb = build['MOTHERBOARD'], ram = build['RAM'], psu = build['PSU'], cooling = build['COOLING']
  if (cpu && mb) {
    const s1 = extractSocket(cpu.name), s2 = extractSocket(mb.name)
    if (s1 && s2 && s1 !== s2) issues.push(`❌ CPU (${s1}) incompatible con Motherboard (${s2}). Necesitás placa ${s1}.`)
  }
  if (ram && mb) {
    const r1 = extractRAMType(ram.name), r2 = extractRAMType(mb.name)
    if (r1 && r2 && r1 !== r2) issues.push(`❌ RAM (${r1}) incompatible con Motherboard (${r2}).`)
  }
  if (psu) {
    const total = calcTotalWatt(build), pw = extractPSUWatt(psu.name)
    if (pw > 0) {
      const usage = (total / pw) * 100
      if (total > pw * 0.85) issues.push(`❌ Fuente ${pw}W insuficiente. Consumo estimado: ${total}W (${Math.round(usage)}%).`)
      else if (total > pw * 0.7) warnings.push(`⚠ Fuente ${pw}W con poco margen. Consumo: ${total}W (${Math.round(usage)}%). Recomendamos ≥20% margen.`)
    }
  }
  if (cpu && !cooling) {
    const n = cpu.name.toLowerCase()
    if (n.includes('ryzen 9') || n.includes('core ultra 9') || n.includes('i9') || n.includes('i7')) {
      warnings.push(`⚠ Con este procesador se recomienda cooling adicional para máximo rendimiento.`)
    }
  }
  return { ok: issues.length === 0, issues, warnings }
}
function getRecommendations(build: Record<string, any>): string[] {
  const tips: string[] = []
  const cpu = build['CPU'], gpu = build['GPU'], ram = build['RAM']
  if (cpu && !build['MOTHERBOARD']) {
    const s = extractSocket(cpu.name)
    if (s) tips.push(`💡 CPU requiere Motherboard socket ${s}.`)
  }
  if (!gpu && Object.keys(build).length >= 3) tips.push(`💡 Agregá una Tarjeta Gráfica. Para 1080p: RTX 4060. Para 1440p: RTX 4070.`)
  if (!ram && cpu && (cpu.name.toLowerCase().includes('am5') || cpu.name.toLowerCase().includes('ryzen 7'))) {
    tips.push(`💡 Con este procesador se recomienda DDR5.`)
  }
  if (gpu && !build['PSU']) {
    const n = gpu.name.toLowerCase()
    const w = n.includes('rtx 4090') ? 1000 : n.includes('rtx 4080') ? 850 : n.includes('rtx 4070') ? 750 : 650
    tips.push(`💡 Con esta GPU se recomienda fuente de al menos ${w}W 80+ Gold.`)
  }
  return tips.slice(0, 2)
}

// ── 3D PC Visualizer ──────────────────────────────────────────────────────────
// Box: W=120, D=80, H=210
// Front/Back: translateZ(±40)  Right/Left: rotateY(±90) translateZ(60)  Top/Bottom: rotateX(±90) translateZ(105)
function PCVisualizer({ build, buildCount }: { build: Record<string, any>; buildCount: number }) {
  const [flashSlot, setFlashSlot] = useState<string | null>(null)
  const prevBuild = useRef<Record<string, any>>({})

  useEffect(() => {
    const newSlots = Object.keys(build).filter(k => !prevBuild.current[k])
    if (newSlots.length > 0) {
      setFlashSlot(newSlots[0])
      const t = setTimeout(() => setFlashSlot(null), 900)
      prevBuild.current = { ...build }
      return () => clearTimeout(t)
    }
    prevBuild.current = { ...build }
  }, [build])

  const has = (s: string) => !!build[s]
  const fl = (s: string) => flashSlot === s
  const pct = buildCount / 8
  const g = (a: number) => `rgba(0,180,216,${a})`

  const faceStyle = (extra: React.CSSProperties): React.CSSProperties => ({
    position: 'absolute',
    backfaceVisibility: 'hidden',
    ...extra,
  })

  return (
    <div style={{
      position: 'relative',
      background: 'linear-gradient(160deg, #09111b 0%, #0d1117 100%)',
      border: '1px solid #21262d',
      borderRadius: 16,
      overflow: 'hidden',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 80% 70% at 50% 65%, ${g(0.04 + pct * 0.2)}, transparent 65%)`,
        transition: 'background 1.2s',
      }} />

      {/* Header bar */}
      <div style={{ position: 'relative', padding: '14px 16px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#00b4d8', textTransform: 'uppercase' }}>Vista 3D en tiempo real</p>
          <p style={{ fontSize: 12, color: '#8b949e', marginTop: 3 }}>
            {buildCount === 0 ? 'Seleccioná componentes →' : buildCount === 8 ? '¡Tu PC está lista para volar!' : `${buildCount} de 8 piezas ensambladas`}
          </p>
        </div>
        <div style={{
          padding: '4px 10px', borderRadius: 999,
          background: buildCount === 8 ? 'rgba(63,185,80,.15)' : g(0.08),
          border: `1px solid ${buildCount === 8 ? 'rgba(63,185,80,.4)' : g(0.25)}`,
          flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, fontWeight: 900, color: buildCount === 8 ? '#3fb950' : '#00b4d8' }}>
            {buildCount === 8 ? '✓ COMPLETO' : `${Math.round(pct * 100)}%`}
          </span>
        </div>
      </div>

      {/* 3D Scene */}
      <div style={{ perspective: '620px', perspectiveOrigin: '50% 38%', height: 310, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

        {/* Ground glow */}
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          width: 190, height: 22,
          background: `radial-gradient(ellipse, ${g(0.07 + pct * 0.22)}, transparent)`,
          filter: 'blur(14px)', pointerEvents: 'none', transition: 'background 1s',
        }} />

        {/* Flash overlay on component add */}
        {flashSlot && (
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 20,
            background: `radial-gradient(circle at 50% 50%, ${g(0.35)}, transparent 55%)`,
            animation: 'pcFlash 0.9s ease-out forwards',
          }} />
        )}

        {/* THE 3D PC BOX */}
        <div style={{
          transformStyle: 'preserve-3d',
          animation: 'pcSpin 18s linear infinite',
          width: 120, height: 210,
          position: 'relative',
          marginTop: -10,
        }}>

          {/* ── FRONT FACE ── */}
          <div style={faceStyle({
            inset: 0,
            transform: 'translateZ(40px)',
            background: 'linear-gradient(175deg, #191e28 0%, #131820 100%)',
            border: '1.5px solid #2d3748',
            borderRadius: '6px 6px 3px 3px',
            display: 'flex', flexDirection: 'column',
          })}>
            {/* RGB top strip */}
            <div style={{
              height: 4,
              background: buildCount > 0 ? 'linear-gradient(90deg,#ff0080,#7928ca,#00b4d8,#3fb950,#ffd700,#ff0080)' : '#1e2533',
              backgroundSize: '300% 100%',
              animation: buildCount > 0 ? 'rgbShift 3s linear infinite' : 'none',
              borderRadius: '6px 6px 0 0',
              transition: 'background 0.6s',
            }} />

            {/* Main mesh area */}
            <div style={{
              margin: '5px 5px 4px', flex: 1,
              background: buildCount > 0 ? `radial-gradient(circle at 50% 35%, ${g(0.04 + pct * 0.09)}, transparent 55%), #09111b` : '#09111b',
              border: '1px solid #1e2533', borderRadius: 4, overflow: 'hidden',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 7,
              position: 'relative',
            }}>
              {/* Mesh grid */}
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: 'repeating-linear-gradient(0deg,rgba(255,255,255,.015) 0px,rgba(255,255,255,.015) 1px,transparent 1px,transparent 7px),repeating-linear-gradient(90deg,rgba(255,255,255,.015) 0px,rgba(255,255,255,.015) 1px,transparent 1px,transparent 7px)',
              }} />

              {/* Main fan */}
              <div style={{
                width: 46, height: 46, borderRadius: '50%', position: 'relative', zIndex: 1,
                border: `2px solid ${has('COOLING') ? '#00b4d8' : has('CPU') ? '#2d3748' : '#1e2533'}`,
                background: has('COOLING') ? g(0.06) : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                animation: has('CPU') ? 'fanSpin 1.4s linear infinite' : 'none',
                boxShadow: has('COOLING') ? `0 0 14px ${g(0.4)}` : 'none',
                transition: 'all 0.5s',
              }}>
                <Wind size={21} style={{ color: has('COOLING') ? '#00b4d8' : has('CPU') ? '#2d3748' : '#1a2030', transition: 'color 0.5s' }} />
              </div>

              {/* LED indicators 2×2 */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: '82%', position: 'relative', zIndex: 1 }}>
                {([['CPU',Cpu],['GPU',Monitor],['RAM',MemoryStick],['STORAGE',HardDrive]] as [string, any][]).map(([slot, Icon]) => {
                  const on = has(slot), flash = fl(slot)
                  return (
                    <div key={slot} style={{
                      display: 'flex', alignItems: 'center', gap: 3, padding: '3px 4px', borderRadius: 3,
                      background: on ? (flash ? g(0.32) : g(0.1)) : 'rgba(0,0,0,0.3)',
                      border: `1px solid ${on ? (flash ? '#00b4d8' : g(0.25)) : '#1a2030'}`,
                      transition: 'all 0.4s',
                      animation: flash ? 'slotFlash 0.7s ease-out' : 'none',
                    }}>
                      <Icon size={8} style={{ color: on ? '#00b4d8' : '#253040', flexShrink: 0 }} />
                      <span style={{ fontSize: 8, fontWeight: 800, color: on ? '#7dd3fc' : '#253040' }}>{slot}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Bottom bar: power btn + brand + LEDs */}
            <div style={{
              padding: '4px 6px 5px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              borderTop: '1px solid #1a2030',
            }}>
              <div style={{
                width: 15, height: 15, borderRadius: '50%',
                border: `1.5px solid ${buildCount > 0 ? '#00b4d8' : '#1e2533'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: buildCount > 0 ? `0 0 ${5 + pct * 9}px ${g(0.75)}` : 'none',
                transition: 'all 0.5s',
              }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: buildCount > 0 ? '#00b4d8' : '#1e2533', transition: 'background 0.5s' }} />
              </div>
              <span style={{ fontSize: 7, fontWeight: 900, letterSpacing: '0.12em', color: '#1e2a38' }}>TECNOVATE</span>
              <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: has('PSU') ? '#3fb950' : '#1a2030', boxShadow: has('PSU') ? '0 0 5px rgba(63,185,80,0.7)' : 'none', transition: 'all 0.5s' }} />
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: has('MOTHERBOARD') ? '#00b4d8' : '#1a2030', animation: has('MOTHERBOARD') ? 'ledBlink 2s ease-in-out infinite' : 'none', transition: 'background 0.5s' }} />
              </div>
            </div>
          </div>

          {/* ── BACK FACE ── */}
          <div style={faceStyle({
            inset: 0,
            transform: 'rotateY(180deg) translateZ(40px)',
            background: '#0a0e15', border: '1.5px solid #1a2030',
            borderRadius: '6px 6px 3px 3px',
          })}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ margin: `${10 + i * 38}px 10px 0`, height: 8, background: '#111620', borderRadius: 2, border: '1px solid #1a2030' }} />
            ))}
          </div>

          {/* ── RIGHT SIDE (glass window) ── */}
          {/* Centered in 120px wide container: left=(120-80)/2=20 */}
          <div style={faceStyle({
            width: 80, height: 210, top: 0, left: 20,
            transform: 'rotateY(90deg) translateZ(60px)',
            background: has('MOTHERBOARD') ? 'linear-gradient(135deg,rgba(5,12,22,0.94),rgba(0,18,30,0.92))' : 'rgba(8,11,18,0.96)',
            border: '1.5px solid #2d3748',
            borderRadius: '0 6px 6px 0', overflow: 'hidden',
          })}>
            {has('MOTHERBOARD') && (
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 14px,rgba(0,180,216,.06) 14px,rgba(0,180,216,.06) 15px),repeating-linear-gradient(90deg,transparent,transparent 14px,rgba(0,180,216,.06) 14px,rgba(0,180,216,.06) 15px)' }} />
            )}
            {has('RAM') && [0,1].map(i => (
              <div key={i} style={{
                position: 'absolute', top: 12, left: 7 + i * 16, width: 9, height: 58,
                background: `linear-gradient(180deg,#1a2640,${fl('RAM') ? g(0.5) : g(0.2)})`,
                border: `1px solid ${fl('RAM') ? '#00b4d8' : g(0.35)}`,
                borderRadius: '2px 2px 0 0',
                boxShadow: fl('RAM') ? `0 0 8px ${g(0.5)}` : 'none',
                transition: 'all 0.4s',
              }}>
                <div style={{ height: 3, background: fl('RAM') ? '#00b4d8' : g(0.4), borderRadius: '2px 2px 0 0' }} />
              </div>
            ))}
            {has('GPU') && (
              <div style={{
                position: 'absolute', left: 7, bottom: 50, width: 64, height: 28,
                background: 'linear-gradient(135deg,#141d2a,#0d1420)',
                border: `1px solid ${fl('GPU') ? '#00b4d8' : g(0.35)}`,
                borderRadius: 3,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                boxShadow: `0 0 ${fl('GPU') ? 14 : 6}px ${g(fl('GPU') ? 0.5 : 0.2)}`,
                transition: 'all 0.4s',
              }}>
                <Monitor size={9} style={{ color: '#00b4d8' }} />
                {[0,1].map(i => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: g(0.4), border: `1px solid ${g(0.3)}` }} />)}
              </div>
            )}
            {has('STORAGE') && (
              <div style={{ position: 'absolute', left: 7, top: 88, width: 30, height: 12, background: '#141d2a', border: `1px solid ${g(0.2)}`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <HardDrive size={7} style={{ color: g(0.5) }} />
              </div>
            )}
            {has('COOLING') && (
              <div style={{ position: 'absolute', right: 7, top: 58, width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${g(0.45)}`, animation: 'fanSpin 1.4s linear infinite', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Wind size={10} style={{ color: g(0.6) }} />
              </div>
            )}
            {has('PSU') && (
              <div style={{ position: 'absolute', bottom: 7, left: 7, right: 7, height: 32, background: '#0d1420', border: '1px solid rgba(63,185,80,.3)', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                <Battery size={9} style={{ color: '#3fb950' }} />
                <div style={{ height: 2, flex: 1, background: 'rgba(63,185,80,.2)', borderRadius: 1 }} />
              </div>
            )}
          </div>

          {/* ── LEFT SIDE ── */}
          <div style={faceStyle({
            width: 80, height: 210, top: 0, left: 20,
            transform: 'rotateY(-90deg) translateZ(60px)',
            background: '#080c14', border: '1.5px solid #1a2030',
            borderRadius: '6px 0 0 6px',
          })} />

          {/* ── TOP ── */}
          {/* Centered vertically: top=(210-80)/2=65 */}
          <div style={faceStyle({
            width: 120, height: 80, top: 65, left: 0,
            transform: 'rotateX(90deg) translateZ(105px)',
            background: '#131820', border: '1.5px solid #1e2533',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          })}>
            {[...Array(3)].map((_, i) => (
              <div key={i} style={{ width: 5, height: 52, background: '#1a2436', borderRadius: 2 }} />
            ))}
            {/* Top RGB bar */}
            {buildCount > 0 && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                background: 'linear-gradient(90deg,#ff0080,#7928ca,#00b4d8)',
                backgroundSize: '300% 100%', animation: 'rgbShift 3s linear infinite',
              }} />
            )}
          </div>

          {/* ── BOTTOM ── */}
          <div style={faceStyle({
            width: 120, height: 80, top: 65, left: 0,
            transform: 'rotateX(-90deg) translateZ(105px)',
            background: '#080c14', border: '1.5px solid #1a2030',
          })}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ position: 'absolute', bottom: 6, left: 15 + i * 25, width: 8, height: 8, borderRadius: 2, background: '#0d1420', border: '1px solid #1a2030' }} />
            ))}
          </div>

        </div>
      </div>

      {/* Status */}
      <div style={{ position: 'relative', textAlign: 'center', padding: '10px 16px 14px', borderTop: '1px solid #1a2030' }}>
        {buildCount === 0 ? (
          <p style={{ fontSize: 11, color: '#2d3748' }}>La PC se arma a medida que elegís componentes</p>
        ) : buildCount === 8 ? (
          <p style={{ fontSize: 12, fontWeight: 800, color: '#3fb950' }}>✓ Build completo — ¡Tu PC está lista!</p>
        ) : (
          <p style={{ fontSize: 11, color: '#8b949e' }}>
            <span style={{ color: '#00b4d8', fontWeight: 800 }}>{buildCount}</span>/8 componentes · Seguí ensamblando
          </p>
        )}
      </div>
    </div>
  )
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

  useEffect(() => {
    if (Object.keys(build).length >= 2) setCompat(checkCompatibility(build))
    else setCompat(null)
  }, [build])

  const openSlotModal = async (slotKey: string) => {
    setOpenSlot(slotKey)
    setSearchComp('')
    if (allComponents[slotKey]) { setComponents(allComponents[slotKey]); return }
    setLoadingComps(true)
    try {
      const q = slotKey === 'GPU' ? 'tarjeta+gr' : slotKey === 'CPU' ? 'procesador' : slotKey === 'MOTHERBOARD' ? 'placa+madre' : slotKey === 'RAM' ? 'memoria+ram' : slotKey === 'STORAGE' ? 'ssd' : slotKey === 'PSU' ? 'fuente+de+alimentacion' : slotKey === 'CASE' ? 'gabinete' : slotKey === 'COOLING' ? 'cooler' : ''
      const res = await fetch(`/api/products?limit=100&q=${q}`)
      const data = await res.json()
      const items = data.products || []
      setComponents(items)
      setAllComponents(prev => ({ ...prev, [slotKey]: items }))
    } catch { setComponents([]) }
    finally { setLoadingComps(false) }
  }

  const selectComponent = (comp: any) => {
    setBuild(b => ({ ...b, [openSlot!]: comp }))
    setOpenSlot(null)
    toast.success(`✓ ${comp.name.substring(0, 40)}... seleccionado`)
  }

  const removeSlot = (slot: string) => setBuild(b => { const n = { ...b }; delete n[slot]; return n })

  const totalPrice = Object.values(build).reduce((s: number, c: any) => s + (c?.price || 0), 0)
  const totalWatt = calcTotalWatt(build)
  const psuWatt = build['PSU'] ? extractPSUWatt(build['PSU'].name) : 0
  const recommendations = getRecommendations(build)
  const buildCount = Object.keys(build).length
  const buildPct = Math.round((buildCount / SLOTS.length) * 100)

  const addAllToCart = () => {
    const items = Object.values(build)
    if (!items.length) { toast.error('Agregá al menos un componente'); return }
    items.forEach((comp: any) => addItem({ id: comp.id, name: comp.name, brand: comp.brand || 'Genérico', price: comp.price, image: comp.images?.[0] || '', slug: comp.slug || comp.id }))
    toast.success(`🛒 ${items.length} componentes agregados al carrito!`)
  }

  const filteredComponents = components.filter(c =>
    !searchComp || c.name.toLowerCase().includes(searchComp.toLowerCase()) || (c.brand || '').toLowerCase().includes(searchComp.toLowerCase())
  )

  const getCompatHint = (comp: any) => {
    if (!openSlot) return null
    const result = checkCompatibility({ ...build, [openSlot]: comp })
    if (result.issues.some(i => i.includes(openSlot!) || (openSlot === 'CPU' && i.includes('CPU')) || (openSlot === 'MOTHERBOARD' && i.includes('Motherboard')))) {
      return { ok: false }
    }
    return { ok: true }
  }

  return (
    <div style={{ background: '#0d1117', minHeight: '100vh', color: '#e6edf3' }}>
      <style>{`
        @keyframes pcSpin { from{transform:rotateY(0deg)} to{transform:rotateY(360deg)} }
        @keyframes rgbShift { 0%{background-position:0% 0%} 100%{background-position:200% 0%} }
        @keyframes fanSpin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pcFlash { 0%{opacity:1} 100%{opacity:0} }
        @keyframes slotFlash { 0%{transform:scale(1)} 40%{transform:scale(1.08)} 100%{transform:scale(1)} }
        @keyframes ledBlink { 0%,100%{opacity:1} 50%{opacity:.25} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(5px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .g-slot { transition: border-color .15s, background .15s; }
        .g-slot:hover { background: #161b22 !important; }
        .g-btn { transition: opacity .15s, transform .12s; }
        .g-btn:hover { opacity: .9; transform: translateY(-1px); }
        .g-btn-ghost:hover { background: #21262d !important; }
        .g-comp-row { transition: background .12s, border-color .12s; cursor: pointer; }
        .g-comp-row:hover { background: #161b22 !important; border-color: #00b4d8 !important; }
        .prog-bar { transition: width .6s cubic-bezier(.4,0,.2,1); }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────── */}
      <div style={{ background: '#161b22', borderBottom: '1px solid #30363d' }}>
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Cpu size={13} style={{ color: '#00b4d8' }} />
                <span style={{ fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', color: '#00b4d8', textTransform: 'uppercase' }}>PC Builder · Tecnovate</span>
              </div>
              <h1 style={{ fontSize: 'clamp(20px,3.5vw,32px)', fontWeight: 900, color: '#e6edf3', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
                Armá tu{' '}<span style={{ color: '#00b4d8' }}>PC Gamer</span>
              </h1>
              <p style={{ fontSize: 12, color: '#8b949e', marginTop: 3 }}>Compatibilidad verificada · {buildCount}/{SLOTS.length} componentes</p>
            </div>

            <div className="flex items-center gap-4">
              <div style={{ minWidth: 150 }}>
                <div className="flex justify-between" style={{ fontSize: 11, color: '#8b949e', marginBottom: 6 }}>
                  <span>Progreso</span>
                  <span style={{ color: buildPct === 100 ? '#3fb950' : '#00b4d8', fontWeight: 800 }}>{buildPct}%</span>
                </div>
                <div className="rounded-full overflow-hidden" style={{ height: 5, background: '#21262d' }}>
                  <div className="prog-bar rounded-full" style={{ height: '100%', width: `${buildPct}%`, background: buildPct === 100 ? '#3fb950' : 'linear-gradient(90deg,#0077b6,#00b4d8)' }} />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setBuild({}); setCompat(null) }}
                  className="g-btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold"
                  style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }}>
                  <Trash2 size={13} /> Reset
                </button>
                <button onClick={addAllToCart} disabled={buildCount === 0}
                  className="g-btn flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-black disabled:opacity-30"
                  style={{ background: '#00b4d8', color: '#0d1117' }}>
                  <ShoppingCart size={13} /> Agregar ({buildCount})
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── BODY ───────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* LEFT: PC Visualizer (sticky) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-4 flex flex-col gap-4">

              <PCVisualizer build={build} buildCount={buildCount} />

              {/* Price card */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: '#8b949e', marginBottom: 6, textTransform: 'uppercase' }}>Total del build</p>
                <p style={{ fontSize: 28, fontWeight: 900, lineHeight: 1, color: totalPrice > 0 ? '#00b4d8' : '#2d3748', transition: 'color .3s', marginBottom: 12 }}>
                  {totalPrice > 0 ? formatPrice(totalPrice) : '—'}
                </p>

                {/* Power usage */}
                {totalWatt > 0 && (
                  <div style={{ background: '#0d1117', border: '1px solid #21262d', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
                    <div className="flex justify-between" style={{ marginBottom: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Consumo estimado</span>
                      <span style={{ fontSize: 11, fontWeight: 800, color: totalWatt > psuWatt * .85 ? '#f85149' : '#3fb950' }}>{totalWatt}W</span>
                    </div>
                    {psuWatt > 0 && (
                      <>
                        <div style={{ height: 4, background: '#21262d', borderRadius: 99, overflow: 'hidden' }}>
                          <div className="prog-bar" style={{ height: '100%', borderRadius: 99, width: `${Math.min((totalWatt / psuWatt) * 100, 100)}%`, background: totalWatt > psuWatt * .85 ? '#f85149' : totalWatt > psuWatt * .7 ? '#d29922' : '#3fb950' }} />
                        </div>
                        <p style={{ fontSize: 10, color: '#484f58', marginTop: 5 }}>{psuWatt}W fuente · {psuWatt - totalWatt > 0 ? `+${psuWatt - totalWatt}W margen` : '⚠ Sin margen'}</p>
                      </>
                    )}
                  </div>
                )}

                <button onClick={addAllToCart} disabled={buildCount === 0}
                  className="g-btn w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 disabled:opacity-30"
                  style={{ background: '#00b4d8', color: '#0d1117' }}>
                  <ShoppingCart size={16} /> Agregar todo al carrito
                </button>
              </div>

              {/* Budget guide */}
              <div style={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 12, padding: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.1em', color: '#8b949e', marginBottom: 12, textTransform: 'uppercase' }}>Guía de presupuesto</p>
                {[
                  { label: 'Básica',  range: 'Gs. 8M – 12M',  desc: 'Ryzen 5 · 16GB DDR5 · RTX 4060', color: '#3fb950' },
                  { label: 'Media',   range: 'Gs. 12M – 20M', desc: 'Ryzen 7 · 32GB DDR5 · RTX 4070', color: '#58a6ff' },
                  { label: 'Pro',     range: 'Gs. 20M – 35M', desc: 'Ryzen 9 · 32GB DDR5 · RTX 4080', color: '#00b4d8' },
                ].map(p => (
                  <div key={p.label} className="flex items-start gap-3 py-2.5" style={{ borderBottom: '1px solid #21262d' }}>
                    <div style={{ width: 3, height: 32, borderRadius: 99, background: p.color, flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <p style={{ fontSize: 11, fontWeight: 900, color: p.color }}>{p.label} · {p.range}</p>
                      <p style={{ fontSize: 10, color: '#484f58', marginTop: 2 }}>{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* RIGHT: Component slots */}
          <div className="lg:col-span-3 space-y-2">

            {/* Alerts */}
            {compat?.issues && compat.issues.length > 0 && (
              <div style={{ borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 4, background: 'rgba(248,81,73,.07)', border: '1px solid rgba(248,81,73,.28)' }}>
                <AlertTriangle size={14} style={{ color: '#f85149', flexShrink: 0, marginTop: 1 }} />
                <div>{compat.issues.map((msg, k) => <p key={k} style={{ fontSize: 13, color: '#f85149' }}>{msg}</p>)}</div>
              </div>
            )}
            {compat?.warnings && compat.warnings.length > 0 && !compat.issues?.length && (
              <div style={{ borderRadius: 10, padding: '12px 14px', display: 'flex', gap: 10, marginBottom: 4, background: 'rgba(210,153,34,.06)', border: '1px solid rgba(210,153,34,.28)' }}>
                <AlertTriangle size={14} style={{ color: '#d29922', flexShrink: 0, marginTop: 1 }} />
                <div>{compat.warnings.map((msg, k) => <p key={k} style={{ fontSize: 13, color: '#d29922' }}>{msg}</p>)}</div>
              </div>
            )}
            {compat?.ok && buildCount >= 2 && (
              <div style={{ borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, background: 'rgba(63,185,80,.06)', border: '1px solid rgba(63,185,80,.22)' }}>
                <CheckCircle size={14} style={{ color: '#3fb950' }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: '#3fb950' }}>Build compatible — todos los componentes funcionan entre sí</p>
              </div>
            )}
            {recommendations.length > 0 && (
              <div style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 4, background: 'rgba(0,180,216,.05)', border: '1px solid rgba(0,180,216,.18)' }}>
                {recommendations.map((t, k) => <p key={k} style={{ fontSize: 13, color: '#90e0ef' }}>{t}</p>)}
              </div>
            )}

            {/* Slot cards */}
            {SLOTS.map(slot => {
              const selected = build[slot.key]
              const hasIssue = compat?.issues?.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))
              const hasWarn = compat?.warnings?.some(i => i.includes(slot.key) || (slot.key === 'PSU' && i.includes('fuente')))
              const SlotIcon = SLOT_ICONS[slot.key] || Cpu
              const border = hasIssue ? '#f85149' : hasWarn ? '#d29922' : selected ? '#00b4d8' : '#21262d'
              const bar = hasIssue ? '#f85149' : hasWarn ? '#d29922' : selected ? '#00b4d8' : 'transparent'

              return (
                <div key={slot.key} className="g-slot rounded-xl overflow-hidden"
                  style={{ background: '#161b22', border: `1px solid ${border}`, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: bar, borderRadius: '12px 0 0 12px' }} />
                  <div className="flex items-center gap-4 px-5 py-4 pl-6">

                    <div style={{
                      width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: selected ? 'rgba(0,180,216,.1)' : '#0d1117',
                      border: `1px solid ${selected ? 'rgba(0,180,216,.28)' : '#30363d'}`,
                    }}>
                      <SlotIcon size={18} style={{ color: selected ? '#00b4d8' : '#484f58' }} />
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', color: selected ? '#00b4d8' : '#8b949e', textTransform: 'uppercase' }}>{slot.label}</span>
                        {slot.required && <span style={{ color: '#f85149', fontSize: 10 }}>●</span>}
                        {hasIssue && <AlertTriangle size={11} style={{ color: '#f85149' }} />}
                        {!hasIssue && hasWarn && <AlertTriangle size={11} style={{ color: '#d29922' }} />}
                        {selected && !hasIssue && !hasWarn && <CheckCircle size={11} style={{ color: '#3fb950' }} />}
                      </div>
                      {selected ? (
                        <div className="flex items-center gap-3">
                          {selected.images?.[0] && (
                            <img src={selected.images[0]} alt="" style={{ width: 36, height: 36, objectFit: 'contain', borderRadius: 6, background: '#0d1117', border: '1px solid #30363d', padding: 3, flexShrink: 0 }} />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <p style={{ fontWeight: 600, fontSize: 13, color: '#e6edf3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected.name}</p>
                            <p style={{ fontSize: 11, color: '#8b949e' }}>
                              {selected.brand}
                              {slot.key === 'CPU' && extractSocket(selected.name) && ` · ${extractSocket(selected.name)}`}
                              {slot.key === 'MOTHERBOARD' && extractSocket(selected.name) && ` · ${extractSocket(selected.name)}`}
                              {slot.key === 'RAM' && extractRAMType(selected.name) && ` · ${extractRAMType(selected.name)}`}
                              {slot.key === 'PSU' && extractPSUWatt(selected.name) > 0 && ` · ${extractPSUWatt(selected.name)}W`}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <p style={{ fontSize: 11, color: '#484f58' }}>{slot.tip}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3" style={{ flexShrink: 0 }}>
                      {selected && <p style={{ fontSize: 13, fontWeight: 900, color: '#00b4d8' }}>{formatPrice(selected.price)}</p>}
                      <button onClick={() => openSlotModal(slot.key)}
                        className="g-btn px-4 py-1.5 rounded-lg text-xs font-black"
                        style={selected
                          ? { background: '#21262d', border: '1px solid #30363d', color: '#8b949e' }
                          : { background: '#00b4d8', color: '#0d1117' }}>
                        {selected ? 'Cambiar' : 'Elegir →'}
                      </button>
                      {selected && (
                        <button onClick={() => removeSlot(slot.key)} className="g-btn-ghost p-1.5 rounded-lg" style={{ background: 'transparent', border: '1px solid transparent' }}>
                          <X size={14} style={{ color: '#484f58' }} />
                        </button>
                      )}
                    </div>

                  </div>
                </div>
              )
            })}

          </div>
        </div>
      </div>

      {/* ── MODAL ───────────────────────────────────────── */}
      {openSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(1,4,9,.88)', backdropFilter: 'blur(8px)' }}
          onClick={e => { if (e.target === e.currentTarget) setOpenSlot(null) }}>

          <div className="w-full max-w-2xl flex flex-col rounded-2xl overflow-hidden"
            style={{ maxHeight: '88vh', background: '#161b22', border: '1px solid #30363d', boxShadow: '0 28px 72px rgba(0,0,0,.7), 0 0 0 1px rgba(0,180,216,.12)' }}>

            <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #21262d' }}>
              <div className="flex items-center gap-3">
                {(() => { const Icon = SLOT_ICONS[openSlot] || Cpu; return <Icon size={18} style={{ color: '#00b4d8' }} /> })()}
                <div>
                  <h3 style={{ fontWeight: 900, fontSize: 13, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#e6edf3' }}>{SLOTS.find(s => s.key === openSlot)?.label}</h3>
                  <p style={{ fontSize: 11, color: '#484f58' }}>{filteredComponents.length} opciones disponibles</p>
                </div>
              </div>
              <button onClick={() => setOpenSlot(null)} className="g-btn-ghost p-1.5 rounded-lg">
                <X size={16} style={{ color: '#8b949e' }} />
              </button>
            </div>

            <div className="px-4 py-3" style={{ borderBottom: '1px solid #21262d' }}>
              <div className="flex items-center gap-2 rounded-lg px-3 py-2" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <Search size={14} style={{ color: '#484f58' }} />
                <input autoFocus value={searchComp} onChange={e => setSearchComp(e.target.value)}
                  placeholder="Buscar componente..."
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: '#e6edf3' }} />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-3 space-y-1.5">
              {loadingComps ? (
                <div className="text-center py-16">
                  <div className="w-7 h-7 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p style={{ fontSize: 13, color: '#484f58' }}>Cargando componentes...</p>
                </div>
              ) : filteredComponents.length === 0 ? (
                <p className="text-center py-16" style={{ fontSize: 13, color: '#484f58' }}>Sin resultados</p>
              ) : filteredComponents.map(comp => {
                const isSelected = build[openSlot!]?.id === comp.id
                const hint = getCompatHint(comp)
                return (
                  <div key={comp.id} onClick={() => selectComponent(comp)} className="g-comp-row flex items-center gap-4 p-3 rounded-xl"
                    style={{ background: isSelected ? 'rgba(0,180,216,.07)' : '#0d1117', border: `1px solid ${isSelected ? '#00b4d8' : '#21262d'}` }}>

                    <div style={{ width: 48, height: 48, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#161b22', border: '1px solid #30363d' }}>
                      {comp.images?.[0]
                        ? <img src={comp.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 4 }} />
                        : (() => { const Icon = SLOT_ICONS[openSlot!] || Cpu; return <Icon size={20} style={{ color: '#30363d' }} /> })()}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#00b4d8', marginBottom: 2 }}>{comp.brand}</p>
                      <p style={{ fontSize: 13, fontWeight: 600, color: '#e6edf3', lineHeight: 1.35 }}>{comp.name}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {hint && (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 700, background: hint.ok ? 'rgba(63,185,80,.1)' : 'rgba(248,81,73,.1)', color: hint.ok ? '#3fb950' : '#f85149' }}>
                            {hint.ok ? '✓ Compatible' : '✗ Incompatible'}
                          </span>
                        )}
                        {(openSlot === 'CPU' || openSlot === 'MOTHERBOARD') && extractSocket(comp.name) && (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: '#21262d', color: '#8b949e' }}>{extractSocket(comp.name)}</span>
                        )}
                        {openSlot === 'PSU' && extractPSUWatt(comp.name) > 0 && (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: '#21262d', color: '#8b949e' }}>{extractPSUWatt(comp.name)}W</span>
                        )}
                        {openSlot === 'RAM' && extractRAMType(comp.name) && (
                          <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, background: '#21262d', color: '#8b949e' }}>{extractRAMType(comp.name)}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {comp.oldPrice && comp.oldPrice > comp.price && (
                        <p style={{ fontSize: 11, textDecoration: 'line-through', color: '#484f58' }}>{formatPrice(comp.oldPrice)}</p>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 900, color: '#00b4d8' }}>{formatPrice(comp.price)}</p>
                      {isSelected && (
                        <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 999, fontWeight: 900, marginTop: 3, display: 'inline-block', background: 'rgba(0,180,216,.18)', color: '#00b4d8' }}>✓ ELEGIDO</span>
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
