import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getCurrentRate(): Promise<number> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || 'https://tecnovate-new.vercel.app'}/api/exchange-rate`,
      { cache: 'no-store' }
    )
    const data = await res.json()
    return data?.rate || 7900
  } catch { return 7900 }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const rate = await getCurrentRate()

    const [total, withDiscount] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'ACTIVE', oldPrice: { not: null } } }),
    ])

    // Margen promedio: comparar price actual vs priceUSD * rate (precio base real)
    const products = await prisma.product.findMany({
      where: { status: 'ACTIVE' },
      select: { price: true, specs: true },
    })

    let avgMargin = 0
    const withUsd = products.filter(p => (p.specs as any)?.priceUSD > 0)
    if (withUsd.length > 0) {
      const sumMargin = withUsd.reduce((acc, p) => {
        const baseGs = Number((p.specs as any).priceUSD) * rate
        const current = Number(p.price)
        return acc + ((current - baseGs) / baseGs) * 100
      }, 0)
      avgMargin = Math.round(sumMargin / withUsd.length * 10) / 10
    }

    return NextResponse.json({
      total,
      withDiscount,
      avgMargin,
      productsWithBase: withUsd.length,
      rate,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const body = await req.json()
    const { scope, categoryName, productIds, marginPct, discountPct, resetPrices, resetToBase } = body

    // Tasa actual del día
    const rate = await getCurrentRate()

    // ── Filtro de scope ───────────────────────────────────────────
    let whereClause = `status = 'ACTIVE'`
    if (scope === 'category' && categoryName) whereClause += ` AND "categoryId" IN (SELECT id FROM categories WHERE name = '${categoryName}')`
    if (scope === 'products' && productIds?.length) whereClause += ` AND id = ANY(ARRAY['${productIds.join("','")}']::text[])`

    // ── Reset al precio base (priceUSD × tasa actual) ────────────
    if (resetToBase) {
      const updated = await prisma.$executeRawUnsafe(`
        UPDATE products
        SET price      = ROUND((specs->>'priceUSD')::float * ${rate}),
            "priceBase" = ROUND((specs->>'priceUSD')::float * ${rate}),
            "oldPrice"  = NULL
        WHERE (specs->>'priceUSD')::float > 0
          AND ${whereClause}
      `)
      return NextResponse.json({ ok: true, updated, message: `${updated} productos volvieron al precio base (tasa ${rate} Gs/USD)` })
    }

    // ── Reset descuentos ──────────────────────────────────────────
    if (resetPrices) {
      const updated = await prisma.$executeRawUnsafe(`
        UPDATE products SET "oldPrice" = NULL WHERE ${whereClause}
      `)
      return NextResponse.json({ ok: true, updated, message: `${updated} descuentos eliminados` })
    }

    // ── Validaciones ──────────────────────────────────────────────
    if (marginPct !== undefined && (marginPct < 0 || marginPct > 500)) {
      return NextResponse.json({ error: 'Margen inválido (0-500%)' }, { status: 400 })
    }
    if (discountPct !== undefined && (discountPct < 0 || discountPct > 90)) {
      return NextResponse.json({ error: 'Descuento inválido (0-90%)' }, { status: 400 })
    }

    // ── Aplicar margen sobre priceUSD × tasa actual ──────────────
    const margin      = parseFloat(marginPct)  || 0
    const discount    = parseFloat(discountPct) || 0
    const multiplier  = 1 + margin / 100
    const finalRate   = rate * multiplier

    let updated: number
    if (discount > 0) {
      const divisor = 1 - discount / 100
      updated = await prisma.$executeRawUnsafe(`
        UPDATE products
        SET "priceBase" = ROUND((specs->>'priceUSD')::float * ${rate}),
            price       = ROUND((specs->>'priceUSD')::float * ${finalRate}),
            "oldPrice"  = ROUND((specs->>'priceUSD')::float * ${finalRate} / ${divisor})
        WHERE (specs->>'priceUSD')::float > 0
          AND ${whereClause}
      `)
    } else {
      updated = await prisma.$executeRawUnsafe(`
        UPDATE products
        SET "priceBase" = ROUND((specs->>'priceUSD')::float * ${rate}),
            price       = ROUND((specs->>'priceUSD')::float * ${finalRate}),
            "oldPrice"  = NULL
        WHERE (specs->>'priceUSD')::float > 0
          AND ${whereClause}
      `)
    }

    if (!updated) {
      return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, updated, message: `${updated} productos actualizados (tasa ${rate} Gs/USD, margen ${margin}%)` })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 })
  }
}
