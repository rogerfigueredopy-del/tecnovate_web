/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TECNOVATE — Importar productos de Nissei a la BD           ║
 * ║                                                              ║
 * ║  Correr DESPUÉS de scraper-nissei-full.js:                   ║
 * ║    node import-nissei-full.js                                ║
 * ║                                                              ║
 * ║  O para importar desde archivo específico:                   ║
 * ║    node import-nissei-full.js --file mis-productos.json      ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { PrismaClient } = require('@prisma/client')
const fs    = require('fs')
const path  = require('path')
const prisma = new PrismaClient()

const CATEGORIAS = [
  'Notebooks','Componentes','Gaming','Celulares',
  'Monitores','Accesorios','Networking','Impresoras'
]

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 80)
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║  TECNOVATE — Importador de Productos Nissei       ║')
  console.log('╚═══════════════════════════════════════════════════╝\n')

  // Buscar archivo fuente
  const fileArg = process.argv.indexOf('--file')
  const srcFile = fileArg !== -1
    ? process.argv[fileArg + 1]
    : 'nissei-productos.json'

  if (!fs.existsSync(srcFile)) {
    console.error(`❌ No encontré el archivo: ${srcFile}`)
    console.log('   Primero corré: node scraper-nissei-full.js')
    process.exit(1)
  }

  const productos = JSON.parse(fs.readFileSync(srcFile, 'utf8'))
  console.log(`📦 ${productos.length} productos para importar desde ${srcFile}\n`)

  // ── Crear categorías ───────────────────────────────────────────
  const catMap = {}
  for (const nombre of CATEGORIAS) {
    const slug = slugify(nombre)
    const cat  = await prisma.category.upsert({
      where:  { slug },
      update: {},
      create: { name: nombre, slug },
    })
    catMap[nombre] = cat.id
  }
  console.log('✓ Categorías listas\n')

  // ── Importar productos en lotes ────────────────────────────────
  const BATCH    = 10
  const usedSlugs = new Set()
  let ok = 0, skip = 0, updated = 0

  for (let i = 0; i < productos.length; i += BATCH) {
    const lote = productos.slice(i, i + BATCH)

    for (const p of lote) {
      try {
        const catName    = p.categoryName || 'Accesorios'
        const categoryId = catMap[catName] || catMap['Accesorios']

        // Slug único
        let slug = p.slug || slugify(p.name)
        if (usedSlugs.has(slug)) {
          slug = slug + '-' + Math.random().toString(36).substring(2, 5)
        }
        usedSlugs.add(slug)

        const result = await prisma.product.upsert({
          where:  { slug },
          update: {
            price:    p.price,
            oldPrice: p.oldPrice || null,
            stock:    p.stock ?? 10,
            images:   p.images || [],
            description: p.description || '',
            specs:    p.specs || {},
          },
          create: {
            name:          p.name,
            slug,
            brand:         p.brand || 'Genérico',
            sku:           p.sku   || null,
            price:         p.price,
            oldPrice:      p.oldPrice || null,
            stock:         p.stock ?? 10,
            images:        p.images || [],
            description:   p.description || '',
            categoryId,
            pcBuilderSlot: p.pcBuilderSlot || null,
            socket:        p.socket   || null,
            wattage:       p.wattage  || null,
            featured:      p.featured || false,
            status:        'ACTIVE',
            specs:         p.specs || {},
          },
        })

        ok++
      } catch (e) {
        skip++
        if (skip <= 3) console.log(`  ⚠ Error en "${p.name?.substring(0, 50)}": ${e.message}`)
      }
    }

    const pct = Math.min(100, Math.round(((i + BATCH) / productos.length) * 100))
    process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ✓ ${ok} importados  ⚠ ${skip} errores  `)
  }

  console.log(`\n\n✅ COMPLETADO`)
  console.log(`   ✓ ${ok} productos importados/actualizados`)
  console.log(`   ✗ ${skip} errores`)
  console.log(`\n🌐 Ya podés ver los productos en tu tienda!`)
  console.log(`   Panel admin: /admin/products`)

  await prisma.$disconnect()
}

main().catch(async e => {
  console.error('\n❌ Error fatal:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
