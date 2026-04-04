// Recalcula priceBase = priceUSD * tasa_actual para todos los productos
// El JSON tiene priceUsd (en USD), que es el precio real del proveedor

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getRate() {
  try {
    const res = await fetch('https://tecnovate-new.vercel.app/api/exchange-rate')
    const data = await res.json()
    console.log('Tasa obtenida:', data.rate, 'Gs/USD')
    return data.rate
  } catch {
    console.log('No se pudo obtener tasa, usando 7900')
    return 7900
  }
}

async function main() {
  const rate = await getRate()

  console.log(`Actualizando priceBase = priceUSD × ${rate}...`)

  const updated = await prisma.$executeRawUnsafe(`
    UPDATE products
    SET "priceBase" = ROUND((specs->>'priceUSD')::float * ${rate})
    WHERE (specs->>'priceUSD')::float > 0
  `)

  console.log(`✓ ${updated} productos actualizados.`)
}

main()
  .catch(e => { console.error('Error:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
