'use client'
import { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

export function ExchangeRateBadge() {
  const [rate, setRate]       = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/exchange-rate')
      .then(r => r.json())
      .then(d => { setRate(d.rate); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs animate-pulse"
        style={{ color: 'rgba(255,255,255,0.6)' }}>
        <TrendingUp size={12} />
        <span>USD 1 = Gs. ...</span>
      </div>
    )
  }

  if (!rate) return null

  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold"
      style={{ color: 'rgba(255,255,255,0.85)' }}>
      <TrendingUp size={12} />
      <span>USD 1 = Gs. {rate.toLocaleString('es-PY')}</span>
    </div>
  )
}
