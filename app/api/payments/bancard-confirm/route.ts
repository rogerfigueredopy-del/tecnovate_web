import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// Bancard llama a este endpoint para confirmar pagos
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { operation } = body

    if (!operation) {
      return NextResponse.json({ status: 'error', message: 'Invalid payload' }, { status: 400 })
    }

    const { shop_process_id, response, response_details } = operation

    // Verificar token de seguridad
    const expectedToken = crypto
      .createHash('md5')
      .update(`${process.env.BANCARD_PRIVATE_KEY}${shop_process_id}confirm`)
      .digest('hex')

    if (operation.security_information?.token !== expectedToken) {
      console.error('Bancard: token inválido')
      return NextResponse.json({ status: 'error', message: 'Invalid token' }, { status: 401 })
    }

    // Buscar el pedido por paymentId
    const order = await prisma.order.findFirst({
      where: { paymentId: String(shop_process_id) },
    })

    if (!order) {
      return NextResponse.json({ status: 'error', message: 'Order not found' }, { status: 404 })
    }

    // Actualizar estado según respuesta de Bancard
    if (response === 'S') {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      })
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'CANCELLED', notes: response_details?.description },
      })
    }

    return NextResponse.json({ status: 'success' })
  } catch (error) {
    console.error('Bancard webhook error:', error)
    return NextResponse.json({ status: 'error' }, { status: 500 })
  }
}
