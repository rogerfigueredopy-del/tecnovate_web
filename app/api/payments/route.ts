import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

// ─── BANCARD (pagos locales Paraguay) ────────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Debe iniciar sesión' }, { status: 401 })
  }

  const { method, orderId, amount, returnUrl } = await req.json()

  if (method === 'bancard') {
    return handleBancard(orderId, amount, returnUrl)
  }

  if (method === 'paypal') {
    return handlePayPal(orderId, amount)
  }

  return NextResponse.json({ error: 'Método de pago no válido' }, { status: 400 })
}

async function handleBancard(orderId: string, amount: number, returnUrl: string) {
  const shopProcessId = Date.now()
  const currency = 'PYG'
  const description = `Tecnovate Pedido #${orderId}`

  // Generar token de seguridad Bancard
  const token = crypto
    .createHash('md5')
    .update(`${process.env.BANCARD_PRIVATE_KEY}${shopProcessId}${amount}${currency}`)
    .digest('hex')

  const payload = {
    public_key: process.env.BANCARD_PUBLIC_KEY,
    operation: {
      token,
      shop_process_id: shopProcessId,
      amount: amount.toFixed(2),
      currency,
      additional_data: '',
      description,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?orderId=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/cancel?orderId=${orderId}`,
    },
  }

  try {
    const response = await fetch(
      `${process.env.BANCARD_API_URL}/vpos/api/0.3/single_buy`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )
    const data = await response.json()

    if (data.status === 'success') {
      // Guardar referencia del pago
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentId: String(shopProcessId), paymentMethod: 'bancard' },
      })

      return NextResponse.json({
        processId: data.process_id,
        redirectUrl: `${process.env.BANCARD_API_URL}/checkout/new?process_id=${data.process_id}`,
      })
    }

    return NextResponse.json({ error: 'Error al iniciar pago Bancard' }, { status: 400 })
  } catch {
    return NextResponse.json({ error: 'Error de conexión con Bancard' }, { status: 500 })
  }
}

async function handlePayPal(orderId: string, amount: number) {
  // Obtener token de acceso PayPal
  const authResponse = await fetch(
    'https://api-m.paypal.com/v1/oauth2/token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(
          `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    }
  )
  const { access_token } = await authResponse.json()

  // Crear orden PayPal (convertir PYG a USD aproximado)
  const usdAmount = (amount / 7500).toFixed(2) // ~7500 Gs = 1 USD
  const orderResponse = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access_token}`,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: { currency_code: 'USD', value: usdAmount },
          description: `Tecnovate Pedido #${orderId}`,
        },
      ],
    }),
  })

  const paypalOrder = await orderResponse.json()

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentId: paypalOrder.id, paymentMethod: 'paypal' },
  })

  return NextResponse.json({ paypalOrderId: paypalOrder.id })
}
