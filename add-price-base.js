/**
 * Correr: node add-price-base.js
 * Agrega el campo priceBase a todos los productos existentes
 * (lo setea igual al precio actual como punto de partida)
 */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Agregando priceBase a productos existentes...')

  // Primero necesitamos hacer el db push del schema actualizado
  // Luego seteamos priceBase = price para todos los que no lo tienen

  // updateMany no soporta "SET priceBase = price", usamos SQL raw
  const result = await prisma.$executeRaw`
    UPDATE products SET "priceBase" = price WHERE "priceBase" IS NULL
  `

  console.log(`✅ ${result} productos actualizados con priceBase`)
  await prisma.$disconnect()
}

main().catch(async e => {
  console.error(e.message)
  await prisma.$disconnect()
})
