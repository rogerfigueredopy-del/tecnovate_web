'use client'
import { useState, useEffect } from 'react'
import { Zap, CheckCircle, AlertTriangle, X, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/lib/store/cart'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

const SLOTS = [
  { key: 'CPU', label: 'Procesador', icon: '⚙️', required: true },
  { key: 'MOTHERBOARD', label: 'Motherboard', icon: '🟫', required: true },
  { key: 'RAM', label: 'Memoria RAM', icon: '🔧', required: true },
  { key: 'GPU', label: 'Tarjeta Gráfica', icon: '🎮', required: true },
  { key: 'STORAGE', label: 'Almacenamiento', icon: '💾', required: true },
  { key: 'PSU', label: 'Fuente de Poder', icon: '⚡', required: true },
  { key: 'CASE', label: 'Gabinete', icon: '🏠', required: false },
  { key: 'COOLING', label: 'Enfriamiento', icon: '❄️', required: false },
]

interface Component {
  id: string
  name: string
  brand: string
  price: number
  images: string[]
  specs: any
  wattage?: number
  socket?: string
}

interface BuildState {
  [slot: string]: Component
}

interface CompatResult {
  compatible: boolean
  issues: string[]
  totalPrice: number
}

export default function GamerPage() {
  const [build, setBuild] = useState<BuildState>({})
  const [openSlot, setOpenSlot] = useState<string | null>(null)
  const [components, setComponents] = useState<Component[]>([])
  const [loadingComps, setLoadingComps] = useState(false)
  const [compat, setCompat] = useState<CompatResult | null>(null)
  const [checkingCompat, setCheckingCompat] = useState(false)
  const addItem = useCartStore(s => s.addItem)

  // Load components for selected slot
  useEffect(() => {
    if (!openSlot) return
    setLoadingComps(true)
    fetch(`/api/pc-builder?slot=${openSlot}`)
      .then(r => r.json())
      .then(data => setComponents(data))
      .finally(() => setLoadingComps(false))
  }, [openSlot])

  // Check compatibility whenever build changes
  useEffect(() => {
    const ids = Object.values(build).length
    if (ids < 2) { setCompat(null); return }
    setCheckingCompat(true)
    const componentIds = Object.fromEntries(
      Object.entries(build).map(([slot, comp]) => [slot, comp.id])
    )
    fetch('/api/pc-builder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ components: componentIds }),
    })
      .then(r => r.json())
      .then(setCompat)
      .finally(() => setCheckingCompat(false))
  }, [build])

  const selectComponent = (comp: Component) => {
    setBuild(b => ({ ...b, [openSlot!]: comp }))
    setOpenSlot(null)
    toast.success(`${comp.name} seleccionado`)
  }

  const removeSlot = (slot: string) => {
    setBuild(b => { const n = { ...b }; delete n[slot]; return n })
  }

  const totalWatt = Object.values(build).reduce((s, c) => s + (c.wattage || 0), 0)
  const psuPower = (build['PSU']?.specs as any)?.power || 0
  const totalPrice = Object.values(build).reduce((s, c) => s + c.price, 0)
  const selectedCount = Object.keys(build).length

  const addAllToCart = () => {
    Object.values(build).forEach(comp => {
      addItem({
        id: comp.id,
        name: comp.name,
        brand: comp.brand,
        price: comp.price,
        image: comp.images?.[0] || '',
        slug: comp.id,
      })
    })
    toast.success(`✓ ${selectedCount} componentes agregados al carrito`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 border-b border-gray-800 py-10">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-black text-white mb-2">
            Armá tu <span className="text-cyan-400">PC Gamer</span>
          </h1>
          <p className="text-gray-400">Seleccioná cada componente y verificá compatibilidad al instante</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Slot list */}
          <div className="lg:col-span-2 space-y-3">
            {SLOTS.map(slot => {
              const selected = build[slot.key]
              const hasCompatIssue = compat?.issues.some(i => i.includes(slot.key))
              return (
                <div
                  key={slot.key}
                  className={`bg-gray-900 border rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all hover:border-cyan-500/50 ${
                    selected
                      ? hasCompatIssue
                        ? 'border-amber-500/50'
                        : 'border-green-500/30'
                      : 'border-gray-800'
                  }`}
                  onClick={() => setOpenSlot(slot.key)}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-xl shrink-0">
                    {slot.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">
                      {slot.label}
                      {slot.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    {selected ? (
                      <>
                        <div className="font-semibold text-sm text-white truncate">{selected.name}</div>
                        <div className="text-xs text-gray-500">{selected.brand}{selected.wattage ? ` · ${selected.wattage}W` : ''}{selected.socket ? ` · ${selected.socket}` : ''}</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-500">Click para seleccionar</div>
                    )}
                  </div>

                  {/* Compat indicator */}
                  {selected && (
                    <div className="shrink-0">
                      {hasCompatIssue
                        ? <AlertTriangle size={18} className="text-amber-400" />
                        : <CheckCircle size={18} className="text-green-400" />
                      }
                    </div>
                  )}

                  {/* Price + remove */}
                  {selected && (
                    <div className="shrink-0 text-right">
                      <div className="text-green-400 font-bold text-sm">{formatPrice(selected.price)}</div>
                      <button
                        onClick={e => { e.stopPropagation(); removeSlot(slot.key) }}
                        className="text-gray-600 hover:text-red-400 mt-1 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}

                  {!selected && (
                    <div className="text-xs text-cyan-500 shrink-0">+ Agregar</div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Summary panel */}
          <div className="space-y-4">
            {/* Compatibility */}
            {compat && (
              <div className={`border rounded-xl p-4 ${compat.compatible ? 'bg-green-950/30 border-green-500/30' : 'bg-amber-950/30 border-amber-500/30'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {compat.compatible
                    ? <CheckCircle size={16} className="text-green-400" />
                    : <AlertTriangle size={16} className="text-amber-400" />
                  }
                  <span className="font-semibold text-sm">
                    {compat.compatible ? 'Componentes compatibles ✓' : 'Revisar compatibilidad'}
                  </span>
                </div>
                {compat.issues.map((issue, i) => (
                  <p key={i} className="text-xs text-amber-300 mt-1">{issue}</p>
                ))}
              </div>
            )}

            {/* Power */}
            {totalWatt > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                  <Zap size={12} />
                  Consumo estimado
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Total componentes</span>
                  <span className="font-semibold">{totalWatt}W</span>
                </div>
                {psuPower > 0 && (
                  <>
                    <div className="flex justify-between text-sm mb-3">
                      <span className="text-gray-400">Fuente seleccionada</span>
                      <span className="font-semibold">{psuPower}W</span>
                    </div>
                    <div className="bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          totalWatt / psuPower > 0.8 ? 'bg-amber-400' : 'bg-green-400'
                        }`}
                        style={{ width: `${Math.min((totalWatt / psuPower) * 100, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {psuPower - totalWatt > 0 ? `+${psuPower - totalWatt}W de margen` : '⚠ Fuente insuficiente'}
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Price summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
              <div className="text-sm font-semibold mb-3 text-cyan-400">Resumen de build</div>
              {Object.entries(build).map(([slot, comp]) => {
                const def = SLOTS.find(s => s.key === slot)
                return (
                  <div key={slot} className="flex justify-between text-xs text-gray-400 mb-2">
                    <span>{def?.label}</span>
                    <span className="text-gray-300">{formatPrice(comp.price)}</span>
                  </div>
                )
              })}
              {selectedCount === 0 && (
                <p className="text-xs text-gray-600 text-center py-2">Seleccioná componentes para ver el precio</p>
              )}
              <div className="border-t border-gray-800 mt-3 pt-3 flex justify-between">
                <span className="font-bold">Total</span>
                <span className="font-black text-lg text-green-400">{formatPrice(totalPrice)}</span>
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {selectedCount}/{SLOTS.length} componentes
              </div>
            </div>

            <button
              onClick={addAllToCart}
              disabled={selectedCount === 0}
              className="w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600 text-black font-bold py-3 rounded-xl transition-colors"
            >
              <ShoppingCart size={18} />
              Agregar todo al carrito
            </button>
            <button
              onClick={() => setBuild({})}
              disabled={selectedCount === 0}
              className="w-full text-sm text-gray-500 hover:text-gray-300 py-2 transition-colors disabled:opacity-30"
            >
              Limpiar build
            </button>
          </div>
        </div>
      </div>

      {/* Component selector modal */}
      {openSlot && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={() => setOpenSlot(null)}>
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-gray-800 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {SLOTS.find(s => s.key === openSlot)?.icon} Seleccionar {SLOTS.find(s => s.key === openSlot)?.label}
              </h3>
              <button onClick={() => setOpenSlot(null)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="overflow-y-auto p-4 space-y-3">
              {loadingComps ? (
                <div className="text-center py-12 text-gray-500">Cargando componentes...</div>
              ) : components.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No hay componentes disponibles en este momento.</p>
                  <p className="text-xs mt-2">Cargá productos desde el Panel Admin con el slot correspondiente.</p>
                </div>
              ) : (
                components.map(comp => {
                  const isSelected = build[openSlot!]?.id === comp.id
                  // Check socket compat hint
                  const cpuSocket = build['CPU']?.socket
                  const mbSocket = build['MOTHERBOARD']?.socket
                  let compatHint = ''
                  if (openSlot === 'MOTHERBOARD' && cpuSocket && comp.socket) {
                    compatHint = comp.socket === cpuSocket ? '✓ Compatible con tu CPU' : `⚠ Requiere CPU ${comp.socket}`
                  }
                  if (openSlot === 'CPU' && mbSocket && comp.socket) {
                    compatHint = comp.socket === mbSocket ? '✓ Compatible con tu Motherboard' : `⚠ Requiere MB ${comp.socket}`
                  }

                  return (
                    <div
                      key={comp.id}
                      onClick={() => selectComponent(comp)}
                      className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all border ${
                        isSelected ? 'border-cyan-500 bg-cyan-500/10' : 'border-gray-800 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center text-2xl shrink-0">
                        {comp.images?.[0] ? (
                          <img src={comp.images[0]} alt="" className="w-full h-full object-contain rounded-xl" />
                        ) : (
                          SLOTS.find(s => s.key === openSlot)?.icon
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-white">{comp.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {comp.brand}
                          {comp.socket && ` · Socket ${comp.socket}`}
                          {comp.wattage && ` · ${comp.wattage}W`}
                        </div>
                        {compatHint && (
                          <div className={`text-xs mt-1 font-medium ${compatHint.startsWith('✓') ? 'text-green-400' : 'text-amber-400'}`}>
                            {compatHint}
                          </div>
                        )}
                      </div>
                      <div className="text-green-400 font-bold text-sm shrink-0">{formatPrice(comp.price)}</div>
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
