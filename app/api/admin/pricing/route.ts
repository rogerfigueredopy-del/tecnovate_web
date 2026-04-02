import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const [total, stats] = await Promise.all([
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.aggregate({
        where: { status: 'ACTIVE' },
        _avg: { price: true },
        _min: { price: true },
        _max: { price: true },
      }),
    ])

    const withDiscount = await prisma.product.count({
      where: { status: 'ACTIVE', oldPrice: { not: null } },
    })

    // Calcular margen promedio actual (solo productos con priceBase > 0)
    const conBase = await prisma.product.findMany({
      where: { status: 'ACTIVE', priceBase: { not: null, gt: 0 } },
      select: { price: true, priceBase: true },
    })

    let avgMargin = 0
    if (conBase.length > 0) {
      const sumMargin = conBase.reduce((acc, p) => {
        const base = Number(p.priceBase)
        const current = Number(p.price)
        return acc + ((current - base) / base) * 100
      }, 0)
      avgMargin = Math.round(sumMargin / conBase.length * 10) / 10
    }

    return NextResponse.json({
      total,
      withDiscount,
      avgPrice:  Math.round(stats._avg.price || 0),
      minPrice:  Math.round(stats._min.price || 0),
      maxPrice:  Math.round(stats._max.price || 0),
      avgMargin,
      productsWithBase: conBase.length,
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

    // ── Filtro de scope ───────────────────────────────────────────
    let where: any = { status: 'ACTIVE' }
    if (scope === 'category' && categoryName) where = { ...where, category: { name: categoryName } }
    if (scope === 'products' && productIds?.length) where = { id: { in: productIds } }

    // ── Reset al precio base ──────────────────────────────────────
    if (resetToBase) {
      let updated: number
      if (scope === 'products' && productIds?.length) {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = "priceBase", "oldPrice" = NULL
          WHERE id = ANY(${productIds}::text[])
            AND "priceBase" IS NOT NULL AND "priceBase" > 0
        `
      } else if (scope === 'category' && categoryName) {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = "priceBase", "oldPrice" = NULL
          FROM categories
          WHERE products."categoryId" = categories.id
            AND categories.name = ${categoryName}
            AND products."priceBase" IS NOT NULL AND products."priceBase" > 0
            AND products.status = 'ACTIVE'
        `
      } else {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = "priceBase", "oldPrice" = NULL
          WHERE "priceBase" IS NOT NULL AND "priceBase" > 0
            AND status = 'ACTIVE'
        `
      }
      return NextResponse.json({ ok: true, updated, message: `${updated} productos volvieron al precio base` })
    }

    // ── Reset descuentos (solo oldPrice) ──────────────────────────
    if (resetPrices) {
      const r = await prisma.product.updateMany({ where, data: { oldPrice: null } })
      return NextResponse.json({ ok: true, updated: r.count, message: `${r.count} descuentos eliminados` })
    }

    // ── Validaciones ──────────────────────────────────────────────
    if (marginPct !== undefined && (marginPct < 0 || marginPct > 500)) {
      return NextResponse.json({ error: 'Margen inválido (0-500%)' }, { status: 400 })
    }
    if (discountPct !== undefined && (discountPct < 0 || discountPct > 90)) {
      return NextResponse.json({ error: 'Descuento inválido (0-90%)' }, { status: 400 })
    }

    // ── Aplicar precios siempre desde priceBase (SQL raw, una sola query) ───
    const margin   = parseFloat(marginPct)  || 0
    const discount = parseFloat(discountPct) || 0
    const multiplier    = 1 + margin / 100
    // oldPrice = withMargin / (1 - discount/100), solo si discount > 0
    const discountDivisor = discount > 0 ? 1 - discount / 100 : null

    let updated: number
    if (scope === 'products' && productIds?.length) {
      if (discountDivisor !== null) {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price    = ROUND(COALESCE("priceBase", price) * ${multiplier}),
              "oldPrice" = ROUND(ROUND(COALESCE("priceBase", price) * ${multiplier}) / ${discountDivisor})
          WHERE id = ANY(${productIds}::text[])
        `
      } else {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = ROUND(COALESCE("priceBase", price) * ${multiplier}), "oldPrice" = NULL
          WHERE id = ANY(${productIds}::text[])
        `
      }
    } else if (scope === 'category' && categoryName) {
      if (discountDivisor !== null) {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price    = ROUND(COALESCE(products."priceBase", products.price) * ${multiplier}),
              "oldPrice" = ROUND(ROUND(COALESCE(products."priceBase", products.price) * ${multiplier}) / ${discountDivisor})
          FROM categories
          WHERE products."categoryId" = categories.id
            AND categories.name = ${categoryName}
            AND products.status = 'ACTIVE'
        `
      } else {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = ROUND(COALESCE(products."priceBase", products.price) * ${multiplier}), "oldPrice" = NULL
          FROM categories
          WHERE products."categoryId" = categories.id
            AND categories.name = ${categoryName}
            AND products.status = 'ACTIVE'
        `
      }
    } else {
      if (discountDivisor !== null) {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price    = ROUND(COALESCE("priceBase", price) * ${multiplier}),
              "oldPrice" = ROUND(ROUND(COALESCE("priceBase", price) * ${multiplier}) / ${discountDivisor})
          WHERE status = 'ACTIVE'
        `
      } else {
        updated = await prisma.$executeRaw`
          UPDATE products
          SET price = ROUND(COALESCE("priceBase", price) * ${multiplier}), "oldPrice" = NULL
          WHERE status = 'ACTIVE'
        `
      }
    }

    if (!updated) {
      return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 })
    }

    return NextResponse.json({ ok: true, updated, message: `${updated} productos actualizados` })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 })
  }
}
