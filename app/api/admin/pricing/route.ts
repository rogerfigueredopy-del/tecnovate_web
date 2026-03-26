import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const body = await req.json()
  const {
    scope,        // 'all' | 'category' | 'products'
    categoryName, // si scope === 'category'
    productIds,   // si scope === 'products' — array de ids
    marginPct,    // % de margen sobre precio base (ej: 20 = +20%)
    discountPct,  // % de descuento a mostrar (ej: 15 = -15% sobre precio final)
  } = body

  // Validaciones
  if (marginPct !== undefined && (marginPct < 0 || marginPct > 500)) {
    return NextResponse.json({ error: 'Margen inválido (0-500%)' }, { status: 400 })
  }
  if (discountPct !== undefined && (discountPct < 0 || discountPct > 90)) {
    return NextResponse.json({ error: 'Descuento inválido (0-90%)' }, { status: 400 })
  }

  // Obtener productos según scope
  let where: any = {}
  if (scope === 'category' && categoryName) {
    where = { category: { name: categoryName } }
  } else if (scope === 'products' && productIds?.length) {
    where = { id: { in: productIds } }
  }
  // scope === 'all' → where = {} (todos)

  const productos = await prisma.product.findMany({
    where,
    select: { id: true, price: true, sku: true },
  })

  if (!productos.length) {
    return NextResponse.json({ error: 'No se encontraron productos' }, { status: 404 })
  }

  // Aplicar precios
  // Lógica:
  //   priceBase    = precio base (lo que pagamos a Atacado con -5%)
  //   priceWithMargin = priceBase * (1 + marginPct/100)
  //   oldPrice (tachado) = priceWithMargin / (1 - discountPct/100)  ← precio "original" simulado
  //   price (final)      = priceWithMargin

  let updated = 0
  const errors: string[] = []

  for (const prod of productos) {
    try {
      const base = prod.price  // precio base actual

      let newPrice    = base
      let newOldPrice: number | null = null

      if (marginPct !== undefined && marginPct > 0) {
        newPrice = Math.round(base * (1 + marginPct / 100))
      }

      if (discountPct !== undefined && discountPct > 0) {
        // oldPrice es el precio "antes del descuento" (lo tachamos)
        newOldPrice = Math.round(newPrice / (1 - discountPct / 100))
      } else {
        newOldPrice = null
      }

      await prisma.product.update({
        where: { id: prod.id },
        data:  { price: newPrice, oldPrice: newOldPrice },
      })
      updated++
    } catch (e: any) {
      errors.push(prod.id)
    }
  }

  return NextResponse.json({
    ok:      true,
    updated,
    errors:  errors.length,
    message: `${updated} productos actualizados`,
  })
}
