import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/pc-builder/components?slot=CPU
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const slot = searchParams.get('slot')

  if (!slot) {
    return NextResponse.json({ error: 'Slot requerido' }, { status: 400 })
  }

  const components = await prisma.product.findMany({
    where: {
      pcBuilderSlot: slot as any,
      status: 'ACTIVE',
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      price: true,
      images: true,
      specs: true,
      wattage: true,
      socket: true,
    },
    orderBy: { price: 'asc' },
  })

  return NextResponse.json(components)
}

// POST /api/pc-builder/check — Verificar compatibilidad
export async function POST(req: NextRequest) {
  const { components } = await req.json()
  // components = { CPU: id, MOTHERBOARD: id, RAM: id, ... }

  const ids = Object.values(components).filter(Boolean) as string[]
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, pcBuilderSlot: true, specs: true, socket: true, wattage: true },
  })

  const issues: string[] = []
  const productMap = Object.fromEntries(products.map(p => [p.pcBuilderSlot, p]))

  // Verificar socket CPU ↔ Motherboard
  const cpu = productMap['CPU']
  const mb = productMap['MOTHERBOARD']
  if (cpu && mb) {
    if (cpu.socket !== mb.socket) {
      issues.push(`⚠ CPU (${cpu.socket}) no es compatible con Motherboard (${mb.socket})`)
    }
  }

  // Verificar potencia total vs fuente
  const psu = productMap['PSU']
  if (psu) {
    const totalWatt = products.reduce((sum, p) => sum + (p.wattage || 0), 0)
    const psuWatt = (psu.specs as any)?.power || 0
    if (totalWatt > psuWatt * 0.8) {
      issues.push(`⚠ La fuente de ${psuWatt}W puede no ser suficiente (consumo estimado: ${totalWatt}W)`)
    }
  }

  const totalPrice = products.reduce(async (sumPromise, p) => {
    const sum = await sumPromise
    const full = await prisma.product.findUnique({ where: { id: p.id }, select: { price: true } })
    return sum + (full?.price || 0)
  }, Promise.resolve(0))

  return NextResponse.json({
    compatible: issues.length === 0,
    issues,
    totalPrice: await totalPrice,
    components: products,
  })
}
