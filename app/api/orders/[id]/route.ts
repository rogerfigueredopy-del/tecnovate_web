import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { product: { select: { name: true, images: true, brand: true } } } },
      address: true,
    },
  })

  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  const userId = (session.user as any).id
  const isAdmin = (session.user as any).role === 'ADMIN'
  if (!isAdmin && order.userId !== userId) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
  }

  return NextResponse.json(order)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { status } = await req.json()
  const order = await prisma.order.update({
    where: { id: params.id },
    data: { status },
  })

  return NextResponse.json(order)
}
