import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const SETTING_KEY = 'usd_pyg_rate'

// Cache en memoria — se refresca cada 1 hora si no hay tasa manual
let cachedRate: number | null = null
let cacheTime = 0
const CACHE_TTL = 60 * 60 * 1000

async function fetchRateFromApi(): Promise<number> {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data?.rates?.PYG) return Math.round(data.rates.PYG)
  } catch {}
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=USD&to=PYG', { next: { revalidate: 3600 } })
    const data = await res.json()
    if (data?.rates?.PYG) return Math.round(data.rates.PYG)
  } catch {}
  return 7900
}

export async function GET() {
  // 1. Verificar si hay tasa manual en DB
  try {
    const setting = await prisma.siteSetting.findUnique({ where: { key: SETTING_KEY } })
    if (setting?.value) {
      const manualRate = parseFloat(setting.value)
      if (manualRate > 0) {
        return NextResponse.json(
          { rate: manualRate, currency: 'PYG', base: 'USD', source: 'manual' },
          { headers: { 'Cache-Control': 'public, max-age=3600' } }
        )
      }
    }
  } catch {}

  // 2. Usar cache en memoria o auto-fetch
  const now = Date.now()
  if (cachedRate && (now - cacheTime) < CACHE_TTL) {
    return NextResponse.json(
      { rate: cachedRate, currency: 'PYG', base: 'USD', source: 'auto', cached: true },
      { headers: { 'Cache-Control': 'public, max-age=3600' } }
    )
  }

  const rate = await fetchRateFromApi()
  cachedRate = rate
  cacheTime  = now

  return NextResponse.json(
    { rate, currency: 'PYG', base: 'USD', source: 'auto', cached: false },
    { headers: { 'Cache-Control': 'public, max-age=3600' } }
  )
}

// Solo admins pueden setear la tasa manual
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { rate } = await req.json()

    if (rate === null || rate === undefined || rate === '') {
      // Eliminar tasa manual → volver a auto-fetch
      await prisma.siteSetting.deleteMany({ where: { key: SETTING_KEY } })
      cachedRate = null
      return NextResponse.json({ ok: true, message: 'Tasa manual eliminada, volviendo a auto-fetch' })
    }

    const parsed = parseFloat(rate)
    if (isNaN(parsed) || parsed < 1000 || parsed > 20000) {
      return NextResponse.json({ error: 'Tasa inválida (rango válido: 1000-20000 PYG/USD)' }, { status: 400 })
    }

    await prisma.siteSetting.upsert({
      where:  { key: SETTING_KEY },
      update: { value: String(parsed) },
      create: { key: SETTING_KEY, value: String(parsed) },
    })

    cachedRate = null // invalidar cache en memoria
    return NextResponse.json({ ok: true, rate: parsed, message: `Tipo de cambio actualizado a ${parsed.toLocaleString('es-PY')} Gs/USD` })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
