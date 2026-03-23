'use client'
import { useState, useEffect, createContext, useContext } from 'react'

interface RateData {
  rate: number
  source: string
  updatedAt: string
}

const RateContext = createContext<{ rate: number; loading: boolean }>({ rate: 6500, loading: true })

// Provider global — poner en layout.tsx para evitar múltiples fetches
export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const [rate, setRate] = useState(6500)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then((d: RateData) => { if (d.rate > 5000) setRate(d.rate) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return <RateContext.Provider value={{ rate, loading }}>{children}</RateContext.Provider>
}

// Hook para usar en cualquier componente
export function useExchangeRate() {
  return useContext(RateContext)
}

// Barra de tipo de cambio para la navbar
export function ExchangeRateBar() {
  const [data, setData] = useState<RateData | null>(null)

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(setData)
      .catch(() => {})
  }, [])

  if (!data) return null

  const fmt = (n: number) => new Intl.NumberFormat('es-PY').format(n)
  const time = new Date(data.updatedAt).toLocaleTimeString('es-PY', {
    hour: '2-digit', minute: '2-digit'
  })

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(255,255,255,0.15)',
        border: '1px solid rgba(255,255,255,0.25)',
        borderRadius: '6px',
        padding: '3px 10px',
        fontSize: '12px',
        color: 'white',
        fontWeight: 600,
      }}
    >
      <span>💱</span>
      <span>USD 1 = Gs. {fmt(data.rate)}</span>
      <span style={{ opacity: 0.7, fontWeight: 400 }}>· {time}</span>
    </div>
  )
}
