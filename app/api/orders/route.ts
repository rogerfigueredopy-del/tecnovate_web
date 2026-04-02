import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    quantity: z.number().int().positive(),
    // price lo ignoramos — se re-consulta desde la DB
  })),
  address: z.object({
    street: z.string(),
    city: z.string(),
    department: z.string(),
    phone: z.string().optional(),
  }),
})

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Debe iniciar sesión' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { items, address } = orderSchema.parse(body)
    const userId = (session.user as any).id

    // Re-consultar precios desde la DB (congela el precio en Gs al momento de compra)
    const productIds = items.map(i => i.id)
    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      select: { id: true, price: true },
    })

    if (dbProducts.length !== productIds.length) {
      return NextResponse.json({ error: 'Uno o más productos no están disponibles' }, { status: 400 })
    }

    const priceMap = Object.fromEntries(dbProducts.map(p => [p.id, p.price]))

    const orderItems = items.map(i => ({
      productId: i.id,
      quantity:  i.quantity,
      price:     priceMap[i.id], // precio en Gs congelado desde la DB
    }))

    const total = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

    // Crear dirección
    const addr = await prisma.address.create({
      data: { userId, ...address, isDefault: false },
    })

    // Crear pedido con items y precios congelados
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        addressId: addr.id,
        status: 'PENDING',
        items: { create: orderItems },
      },
      include: { items: true },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error al crear el pedido' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  const { searchParams } = new URL(req.url)

  const where = isAdmin ? {} : { userId }
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true, images: true } } } },
        address: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, pages: Math.ceil(total / limit) })
}
