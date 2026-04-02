import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/products/filters?category=X&q=Y
// Devuelve marcas disponibles y rango de precios para los filtros del sidebar
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search   = searchParams.get('q')

  const where: any = { status: 'ACTIVE' }

  if (category) {
    where.category = {
      OR: [
        { slug: category.toLowerCase() },
        { name: { equals: category, mode: 'insensitive' } },
      ]
    }
  }
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [brands, priceAgg] = await Promise.all([
    prisma.product.groupBy({
      by: ['brand'],
      where,
      _count: { brand: true },
      orderBy: { _count: { brand: 'desc' } },
      take: 30,
    }),
    prisma.product.aggregate({
      where,
      _min: { price: true },
      _max: { price: true },
    }),
  ])

  return NextResponse.json({
    brands: brands
      .filter(b => b.brand && b.brand.trim().length > 1)
      .map(b => ({ name: b.brand, count: b._count.brand })),
    minPrice: Math.floor(priceAgg._min.price || 0),
    maxPrice: Math.ceil(priceAgg._max.price || 0),
  })
}
