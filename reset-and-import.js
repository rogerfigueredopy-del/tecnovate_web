/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║  TECNOVATE — Limpiar BD e importar productos de Atacado     ║
 * ║                                                              ║
 * ║  Correr: node reset-and-import.js                           ║
 * ║  O para importar sin borrar: node reset-and-import.js --keep║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { PrismaClient } = require('@prisma/client')
const fs    = require('fs')
const prisma = new PrismaClient()

const KEEP    = process.argv.includes('--keep')
const SRC     = process.argv.find(a => a.endsWith('.json')) || 'atacado-productos.json'
const BATCH   = 50

const CATEGORIAS = [
  'Notebooks','Componentes','Gaming','Celulares',
  'Monitores','Accesorios','Networking','Impresoras'
]

function slugify(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 80)
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║  TECNOVATE — Importador Atacado Connect           ║')
  console.log('╚═══════════════════════════════════════════════════╝\n')

  // ── Verificar archivo fuente ───────────────────────────────────
  if (!fs.existsSync(SRC)) {
    console.error(`❌ No encontré: ${SRC}`)
    console.log('   Primero corré el scraper en la consola del navegador')
    process.exit(1)
  }

  const productos = JSON.parse(fs.readFileSync(SRC, 'utf8'))
  console.log(`📦 ${productos.length} productos en ${SRC}`)

  // ── Limpiar BD si no se pasa --keep ────────────────────────────
  if (!KEEP) {
    console.log('\n🗑️  Limpiando productos existentes...')
    await prisma.wishlist.deleteMany()
    await prisma.buildItem.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.review.deleteMany()
    await prisma.product.deleteMany()
    console.log('✓ BD limpia\n')
  }

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
  console.log('✓ Categorías listas')

  // ── Importar en lotes ──────────────────────────────────────────
  const usedSlugs = new Set()
  let ok = 0, skip = 0

  for (let i = 0; i < productos.length; i += BATCH) {
    const lote = productos.slice(i, i + BATCH)

    for (const p of lote) {
      try {
        const catName    = p.categoryName || 'Accesorios'
        const categoryId = catMap[catName] || catMap['Accesorios']

        // Slug único
        let slug = p.slug || slugify(p.name)
        // Limpiar slug si viene con ruta completa /produto/.../slug/id
        if (slug.includes('/')) {
          const parts = slug.split('/')
          slug = parts[parts.length - 2] || parts[parts.length - 1]
        }
        slug = slug.replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 80)
        if (usedSlugs.has(slug)) slug = slug + '-' + (p.atacadoId || Math.random().toString(36).substring(2,5))
        usedSlugs.add(slug)

        // Precio base = precio de Atacado (ya viene con -5%)
        const price    = Math.round(p.price || 0)
        const oldPrice = p.oldPrice ? Math.round(p.oldPrice) : null

        if (price <= 0) { skip++; continue }

        await prisma.product.upsert({
          where:  { slug },
          update: {
            price,
            oldPrice,
            stock:       typeof p.stock === 'boolean' ? 10 : (p.stock || 10),
            images:      p.images || [],
            description: p.description || '',
          },
          create: {
            name:          p.name,
            slug,
            brand:         p.brand || 'Genérico',
            sku:           p.sku ? String(p.sku) : null,
            price,
            oldPrice,
            stock:         typeof p.stock === 'boolean' ? 10 : (p.stock || 10),
            images:        p.images || [],
            description:   p.description || '',
            categoryId,
            pcBuilderSlot: p.pcBuilderSlot || null,
            featured:      p.featured || false,
            status:        'ACTIVE',
            specs:         p.specs || {},
          },
        })
        ok++
      } catch (e) {
        skip++
        if (skip <= 5) console.log(`  ⚠ Error: ${p.name?.substring(0,40)} — ${e.message}`)
      }
    }

    const pct = Math.min(100, Math.round(((i + BATCH) / productos.length) * 100))
    process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ✓ ${ok} importados  ✗ ${skip} errores  `)
  }

  console.log(`\n\n✅ COMPLETADO`)
  console.log(`   ✓ ${ok} productos importados`)
  console.log(`   ✗ ${skip} errores/saltados`)
  console.log(`\n👉 Ahora podés configurar márgenes en: /admin/pricing`)

  await prisma.$disconnect()
}

main().catch(async e => {
  console.error('\n❌ Error fatal:', e.message)
  await prisma.$disconnect()
  process.exit(1)
})
