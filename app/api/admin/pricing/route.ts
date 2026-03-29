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

    return NextResponse.json({
      total,
      withDiscount,
      avgPrice:  Math.round(stats._avg.price || 0),
      minPrice:  Math.round(stats._min.price || 0),
      maxPrice:  Math.round(stats._max.price || 0),
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
    const { scope, categoryName, productIds, marginPct, discountPct, resetPrices } = body

    // ── Reset: volver oldPrice a null (quitar descuentos) ─────────
    if (resetPrices) {
      let where: any = { status: 'ACTIVE' }
      if (scope === 'category' && categoryName) where = { ...where, category: { name: categoryName } }
      if (scope === 'products' && productIds?.length) where = { id: { in: productIds } }

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

    // ── Obtener productos ─────────────────────────────────────────
    let where: any = { status: 'ACTIVE' }
    if (scope === 'category' && categoryName) where = { ...where, category: { name: categoryName } }
    if (scope === 'products' && productIds?.length) where = { id: { in: productIds } }

    const productos = await prisma.product.findMany({
      where,
      select: { id: true, price: true },
    })

    if (!productos.length) {
      return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 })
    }

    // ── Aplicar precios ───────────────────────────────────────────
    let updated = 0
    const margin   = parseFloat(marginPct)  || 0
    const discount = parseFloat(discountPct) || 0

    for (const prod of productos) {
      try {
        const base        = Number(prod.price)
        const withMargin  = margin > 0 ? Math.round(base * (1 + margin / 100)) : base
        const newOldPrice = discount > 0 ? Math.round(withMargin / (1 - discount / 100)) : null

        await prisma.product.update({
          where: { id: prod.id },
          data:  { price: withMargin, oldPrice: newOldPrice },
        })
        updated++
      } catch {}
    }

    return NextResponse.json({ ok: true, updated, message: `${updated} productos actualizados` })

  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Error interno' }, { status: 500 })
  }
}
