/**
 * IMPORTAR PRODUCTOS ATACADO → TECNOVATE
 * Lee el HTML scrapeado y los carga a la BD
 * 
 * Uso: node import-atacado-html.js
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const https = require('https')

const prisma = new PrismaClient()
const MARKUP = 1.15

// ── Categorías de Atacado (exactas como en la web) ────────────────
const CATEGORIAS_ATACADO = [
  // Games
  { slug: 'consoles-jogos',    name: 'Games',              parent: null },
  { slug: 'consolas',          name: 'Consolas',           parent: 'Games' },
  { slug: 'juegos',            name: 'Juegos',             parent: 'Games' },
  { slug: 'accesorios-games',  name: 'Accesorios',         parent: 'Games' },
  // Smartphones
  { slug: 'smartphones',       name: 'Smartphones',        parent: null },
  { slug: 'celulares',         name: 'Celulares',          parent: 'Smartphones' },
  { slug: 'reloj-inteligente', name: 'Reloj inteligente',  parent: 'Smartphones' },
  { slug: 'accesorios-smart',  name: 'Accesorios',         parent: 'Smartphones' },
  // Informática
  { slug: 'informatica',       name: 'Informática',        parent: null },
  { slug: 'notebooks',         name: 'Notebooks',          parent: 'Informática' },
  { slug: 'tablets',           name: 'Tablets',            parent: 'Informática' },
  { slug: 'computadoras',      name: 'Computadoras',       parent: 'Informática' },
  { slug: 'hardware',          name: 'Hardware',           parent: 'Informática' },
  { slug: 'perifericos',       name: 'Periféricos',        parent: 'Informática' },
  { slug: 'red-y-internet',    name: 'Red y Internet',     parent: 'Informática' },
  { slug: 'impresoras',        name: 'Impresoras y Suministros', parent: 'Informática' },
  // Electrónicos
  { slug: 'electronicos',      name: 'Electrónicos',       parent: null },
  { slug: 'casa-inteligente',  name: 'Casa Inteligente',   parent: 'Electrónicos' },
  { slug: 'tv-audio-video',    name: 'TV, Audio y Video',  parent: 'Electrónicos' },
  { slug: 'seguridad',         name: 'Seguridad',          parent: 'Electrónicos' },
  { slug: 'fotografia',        name: 'Fotografía y Filmación', parent: 'Electrónicos' },
  { slug: 'automotriz',        name: 'Automotriz',         parent: 'Electrónicos' },
  { slug: 'deporte-ocio',      name: 'Deporte y Ocio',     parent: 'Electrónicos' },
  { slug: 'belleza',           name: 'Belleza y bienestar', parent: 'Electrónicos' },
  // Electroportátiles
  { slug: 'electroportatiles', name: 'Electroportátiles',  parent: null },
  { slug: 'casa-cocina',       name: 'Casa y Cocina',      parent: 'Electroportátiles' },
  { slug: 'aire-ventilacion',  name: 'Aire y Ventilación', parent: 'Electroportátiles' },
  // Ofertas
  { slug: 'ofertas',           name: 'Ofertas',            parent: null },
  { slug: 'outlet',            name: 'Outlet',             parent: null },
]

// Detectar categoría por nombre del producto
function detectarCategoria(name, code) {
  const n = (name || '').toLowerCase()
  if (n.includes('iphone') || n.includes('samsung') || n.includes('xiaomi') || 
      n.includes('motorola') || n.includes('redmi') || n.includes('poco') ||
      n.includes('smartphone') || n.includes('celular')) return 'celulares'
  if (n.includes('smartwatch') || n.includes('watch') || n.includes('reloj')) return 'reloj-inteligente'
  if (n.includes('ipad') || n.includes('tablet')) return 'tablets'
  if (n.includes('macbook') || n.includes('notebook') || n.includes('laptop')) return 'notebooks'
  if (n.includes('playstation') || n.includes('ps4') || n.includes('ps5')) return 'consolas'
  if (n.includes('nintendo') || n.includes('xbox')) return 'consolas'
  if (n.includes('rtx') || n.includes('gtx') || n.includes('placa de video') || n.includes('gpu')) return 'hardware'
  if (n.includes('processador') || n.includes('ryzen') || n.includes('core i')) return 'hardware'
  if (n.includes('memoria') || n.includes('ssd') || n.includes('nvme')) return 'hardware'
  if (n.includes('monitor')) return 'perifericos'
  if (n.includes('mouse') || n.includes('teclado') || n.includes('headset')) return 'perifericos'
  if (n.includes('roteador') || n.includes('router') || n.includes('access point')) return 'red-y-internet'
  if (n.includes('impressora') || n.includes('impresora')) return 'impresoras'
  if (n.includes('aspirador')) return 'casa-inteligente'
  if (n.includes('smart tv') || n.includes('televisor')) return 'tv-audio-video'
  if (n.includes('camara') || n.includes('camera') || n.includes('gopro')) return 'fotografia'
  if (n.includes('fone') || n.includes('auricular') || n.includes('speaker') || n.includes('caixa de som')) return 'tv-audio-video'
  return 'electronicos' // default
}

function slugify(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 90)
}

function getBrand(name) {
  const brands = ['Apple','Samsung','Xiaomi','Motorola','Redmi','POCO','Sony','LG',
    'ASUS','MSI','Gigabyte','HP','Lenovo','Dell','Acer','AMD','Intel','NVIDIA',
    'Corsair','Kingston','WD','Seagate','SanDisk','Logitech','Razer','HyperX',
    'JBL','Nintendo','PlayStation','Xbox','DJI','GoPro','Canon','Nikon','TCL',
    'Hisense','Philips','TP-Link','Intelbras','Huawei','OnePlus','Realme','Oppo']
  return brands.find(b => (name || '').toLowerCase().includes(b.toLowerCase())) || 'Genérico'
}

async function getExchangeRate() {
  return new Promise(resolve => {
    https.get('https://open.er-api.com/v6/latest/USD', res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const rate = json?.rates?.PYG
          if (rate && rate > 5000) { console.log(`✓ Tipo de cambio: 1 USD = Gs. ${Math.round(rate).toLocaleString()}`); resolve(Math.round(rate)) }
          else resolve(6800)
        } catch { resolve(6800) }
      })
    }).on('error', () => resolve(6800))
  })
}

async function main() {
  // Leer productos del JSON parseado
  const jsonPath = './atacado-html-products.json'
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ No encontré ${jsonPath}`)
    console.log('   Primero corré: node parse-html.js')
    process.exit(1)
  }
  
  const products = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'))
  console.log(`\n🚀 Importando ${products.length} productos...`)

  const exchangeRate = await getExchangeRate()
  console.log(`💹 Margen: +${(MARKUP-1)*100}% | Tipo de cambio: G$ ${exchangeRate.toLocaleString()}\n`)

  // Crear categorías
  console.log('Creando categorías...')
  const catMap = {}
  for (const cat of CATEGORIAS_ATACADO) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { name: cat.name, slug: cat.slug }
    })
    catMap[cat.slug] = c.id
    catMap[cat.name] = c.id
  }
  console.log(`✓ ${Object.keys(catMap).length / 2} categorías creadas\n`)

  let ok = 0, skip = 0
  const usedSlugs = new Set()

  for (const p of products) {
    try {
      if (!p.name || !p.code) { skip++; continue }

      const catSlug = detectarCategoria(p.name, p.code)
      const categoryId = catMap[catSlug] || catMap['electronicos']

      const priceUSD = parseFloat(p.price_usd) || 0
      const priceUSDFinal = parseFloat((priceUSD * MARKUP).toFixed(2))
      const priceGs = Math.round(priceUSD * exchangeRate * MARKUP)

      const brand = getBrand(p.name)
      let slug = slugify(p.name)
      if (!slug || usedSlugs.has(slug)) {
        slug = slugify(p.name) + '-' + p.code
      }
      usedSlugs.add(slug)

      await prisma.product.upsert({
        where: { slug },
        update: {
          price: priceGs,
          images: p.image ? [p.image] : [],
          specs: { priceUSD: priceUSDFinal, priceUSDBase: priceUSD, exchangeRate, sku: p.code },
        },
        create: {
          name: p.name,
          slug,
          brand,
          sku: p.code,
          price: priceGs,
          oldPrice: null,
          stock: 10,
          images: p.image ? [p.image] : [],
          description: '',
          categoryId,
          featured: false,
          status: 'ACTIVE',
          specs: {
            priceUSD: priceUSDFinal,
            priceUSDBase: priceUSD,
            exchangeRate,
            sku: p.code,
          },
        }
      })
      ok++
      if (ok % 50 === 0) console.log(`  [${Math.round(ok/products.length*100)}%] ${ok} importados...`)
    } catch(e) {
      skip++
      if (skip <= 3) console.log(`  ⚠ Error: ${e.message.substring(0,60)}`)
    }
  }

  console.log(`\n✅ COMPLETADO`)
  console.log(`   ✓ ${ok} productos importados`)
  console.log(`   ✗ ${skip} omitidos`)
  console.log(`   Tipo de cambio: G$ ${exchangeRate.toLocaleString()}`)
  console.log(`   Margen aplicado: ${(MARKUP-1)*100}%`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect() })
