import { NextResponse } from 'next/server'

// Cache 1 hora
let cache: { rate: number; source: string; timestamp: number } | null = null
const CACHE_TTL = 60 * 60 * 1000

export async function GET() {
  if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
    return NextResponse.json({
      rate: cache.rate,
      source: cache.source,
      updatedAt: new Date(cache.timestamp).toISOString(),
      cached: true,
    })
  }

  let rate = 6500
  let source = 'fallback'

  // Fuente 1: fawazahmed0 - gratuita, confiable, sin API key
  try {
    const res = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json',
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    if (data?.usd?.pyg && data.usd.pyg > 5000) {
      rate = Math.round(data.usd.pyg)
      source = 'fawazahmed0 (BCP-based)'
    }
  } catch {}

  // Fuente 2: ExchangeRate API (fallback)
  if (rate === 6500) {
    try {
      const res = await fetch('https://open.er-api.com/v6/latest/USD')
      const data = await res.json()
      if (data?.rates?.PYG && data.rates.PYG > 5000) {
        rate = Math.round(data.rates.PYG)
        source = 'exchangerate-api'
      }
    } catch {}
  }

  // Fuente 3: Frankfurter (fallback 2)
  if (rate === 6500) {
    try {
      const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=PYG')
      const data = await res.json()
      if (data?.rates?.PYG && data.rates.PYG > 5000) {
        rate = Math.round(data.rates.PYG)
        source = 'frankfurter'
      }
    } catch {}
  }

  cache = { rate, source, timestamp: Date.now() }

  return NextResponse.json({
    rate,
    source,
    updatedAt: new Date().toISOString(),
    cached: false,
  })
}
