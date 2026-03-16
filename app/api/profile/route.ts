import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const { name, phone } = await req.json()
  const userId = (session.user as any).id

  const user = await prisma.user.update({
    where: { id: userId },
    data: { name, phone },
    select: { id: true, name: true, email: true, phone: true },
  })

  return NextResponse.json(user)
}
