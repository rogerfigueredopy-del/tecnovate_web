const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()
const BATCH_SIZE = 500

async function main() {
  console.log('Leyendo JSON...')
  const arr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'atacado-productos.json'), 'utf8'))
  const pairs = arr.filter(p => p.sku && p.priceUsd > 0).map(p => ({ sku: String(p.sku), usd: Number(p.priceUsd) }))
  console.log(`Pares válidos: ${pairs.length}`)

  let total = 0
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE)
    // CASE statement: UPDATE specs para cada SKU del lote
    const cases = batch.map(({ sku, usd }) => `WHEN sku = '${sku}' THEN jsonb_set(COALESCE(specs,'{}')::jsonb, '{priceUSD}', '${usd}'::jsonb)`).join('\n      ')
    const skus  = batch.map(({ sku }) => `'${sku}'`).join(',')

    await prisma.$executeRawUnsafe(`
      UPDATE products
      SET specs = CASE
        ${cases}
        ELSE specs
      END
      WHERE sku IN (${skus})
    `)
    total += batch.length
    process.stdout.write(`\r${total} / ${pairs.length}`)
  }
  console.log(`\n✓ priceUSD actualizado en specs para ${total} productos.`)
}

main().catch(e => { console.error('\nError:', e.message); process.exit(1) }).finally(() => prisma.$disconnect())
