import { NextResponse } from 'next/server'

// Cache del cambio — se refresca cada 1 hora
let cachedRate: number | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 60 * 1000 // 1 hora

async function fetchRate(): Promise<number> {
  try {
    // Fuente 1: exchangerate-api (gratuita, sin key)
    const res = await fetch(
      'https://open.er-api.com/v6/latest/USD',
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    if (data?.rates?.PYG) return Math.round(data.rates.PYG)
  } catch {}

  try {
    // Fuente 2: frankfurter (respaldo)
    const res = await fetch(
      'https://api.frankfurter.app/latest?from=USD&to=PYG',
      { next: { revalidate: 3600 } }
    )
    const data = await res.json()
    if (data?.rates?.PYG) return Math.round(data.rates.PYG)
  } catch {}

  // Fallback si ambas APIs fallan
  return 7900
}

export async function GET() {
  const now = Date.now()

  // Usar cache si es válido
  if (cachedRate && (now - cacheTime) < CACHE_TTL) {
    return NextResponse.json(
      { rate: cachedRate, currency: 'PYG', base: 'USD', cached: true },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
  }

  const rate = await fetchRate()
  cachedRate = rate
  cacheTime  = now

  return NextResponse.json(
    { rate, currency: 'PYG', base: 'USD', cached: false },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}
