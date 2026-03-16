import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import slugify from '@/lib/utils'

const productSchema = z.object({
  name: z.string().min(3),
  description: z.string().optional(),
  brand: z.string().min(1),
  sku: z.string().optional(),
  price: z.number().positive(),
  oldPrice: z.number().optional(),
  stock: z.number().int().min(0),
  categoryId: z.string(),
  images: z.array(z.string()),
  specs: z.record(z.string()).optional(),
  pcBuilderSlot: z.enum(['CPU','MOTHERBOARD','RAM','GPU','STORAGE','PSU','CASE','COOLING']).optional(),
  wattage: z.number().optional(),
  socket: z.string().optional(),
  featured: z.boolean().optional(),
  status: z.enum(['ACTIVE','DRAFT','OUT_OF_STOCK','ARCHIVED']).optional(),
})

// GET /api/products — Lista con filtros
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get('category')
  const search = searchParams.get('q')
  const pcSlot = searchParams.get('pcSlot')
  const featured = searchParams.get('featured')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '12')

  const where: any = { status: 'ACTIVE' }

  if (category) {
    where.category = { slug: category }
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { brand: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (pcSlot) {
    where.pcBuilderSlot = pcSlot
  }
  if (featured === 'true') {
    where.featured = true
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { category: { select: { name: true, slug: true } } },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ])

  return NextResponse.json({
    products,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  })
}

// POST /api/products — Crear (solo admin)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = productSchema.parse(body)

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: slugify(data.name),
        status: data.status || 'ACTIVE',
      },
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 })
  }
}
