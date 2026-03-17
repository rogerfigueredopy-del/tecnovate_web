import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    price: z.number(),
    quantity: z.number(),
    name: z.string(),
  })),
  total: z.number(),
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
    const { items, total, address } = orderSchema.parse(body)
    const userId = (session.user as any).id

    // Crear dirección
    const addr = await prisma.address.create({
      data: { userId, ...address, isDefault: false },
    })

    // Crear pedido con items
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        addressId: addr.id,
        status: 'PENDING',
        items: {
          create: items.map(i => ({
            productId: i.id,
            quantity: i.quantity,
            price: i.price,
          })),
        },
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
