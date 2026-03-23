/**
 * IMPORTAR PRODUCTOS ATACADO CONNECT → TECNOVATE
 * - Precios en USD + conversión a Gs con +15% de margen
 * - Ejecutar: node import-atacado.js
 *
 * ANTES DE CORRER:
 * 1. Tener el archivo atacado-productos.json en esta carpeta
 * 2. Tener el .env con DATABASE_URL configurado
 */
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const https = require('https')

const prisma = new PrismaClient()
const MARKUP = 0.15 // 15% de margen

// ── Obtener tipo de cambio actual ────────────────────────────────────────────
async function getExchangeRate() {
  return new Promise((resolve) => {
    https.get('https://open.er-api.com/v6/latest/USD', (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          const rate = json?.rates?.PYG
          if (rate && rate > 5000) {
            console.log(`✓ Tipo de cambio: 1 USD = Gs. ${Math.round(rate).toLocaleString('es-PY')}`)
            resolve(Math.round(rate))
          } else {
            console.log('⚠ Usando tipo de cambio de respaldo: Gs. 7700')
            resolve(7700)
          }
        } catch {
          console.log('⚠ Error obteniendo tipo de cambio, usando: Gs. 7700')
          resolve(7700)
        }
      })
    }).on('error', () => {
      console.log('⚠ Sin internet para tipo de cambio, usando: Gs. 7700')
      resolve(7700)
    })
  })
}

// ── Mapeo de categorías de Atacado → Tecnovate ───────────────────────────────
function mapCategory(cat) {
  const map = {
    'celulares': 'Celulares',
    'smartphones': 'Celulares',
    'informatica': 'Componentes',
    'games': 'Gaming',
    'tv-e-video': 'Televisores',
    'audio': 'Audio',
    'tablets': 'Tablets',
    'smartwatch': 'Smartwatches',
    'acessorios': 'Accesorios',
    'cameras': 'Cámaras',
    'drones': 'Drones',
    'consoles': 'Gaming',
    'notebook': 'Notebooks',
    'gamer': 'Gaming',
    'monitor': 'Monitores',
    'componentes': 'Componentes',
    'perifericos': 'Accesorios',
    'headset': 'Audio',
    'teclado': 'Accesorios',
    'mouse': 'Accesorios',
  }
  const lower = (cat || '').toLowerCase()
  for (const [key, value] of Object.entries(map)) {
    if (lower.includes(key)) return value
  }
  return 'Accesorios'
}

// ── Mapeo de slots para PC Builder ───────────────────────────────────────────
function getPCSlot(name, cat) {
  const n = (name || '').toLowerCase()
  const c = (cat || '').toLowerCase()
  if (c.includes('procesador') || n.includes('processador') || n.includes('procesador') || n.includes('ryzen') || n.includes('core i')) return 'CPU'
  if (n.includes('placa mae') || n.includes('placa madre') || n.includes('motherboard')) return 'MOTHERBOARD'
  if (n.includes('rtx') || n.includes('gtx') || n.includes('radeon rx') || n.includes('placa de video') || n.includes('tarjeta grafica')) return 'GPU'
  if ((n.includes('memoria') || n.includes('ram')) && !n.includes('notebook')) return 'RAM'
  if (n.includes(' ssd') || n.includes('nvme') || (n.includes('hd ') && !n.includes('hdmi'))) return 'STORAGE'
  if (n.includes('fonte') || n.includes('fuente') || n.includes('psu')) return 'PSU'
  if (n.includes('gabinete') || n.includes('gabinetto') || n.includes('case')) return 'CASE'
  if (n.includes('cooler') || n.includes('water cooler') || n.includes('dissipador')) return 'COOLING'
  return null
}

// ── Detectar marca ───────────────────────────────────────────────────────────
function getBrand(name) {
  const brands = [
    'Apple','Samsung','Xiaomi','Motorola','Redmi','POCO','OnePlus','Realme',
    'Huawei','Sony','LG','ASUS','MSI','Gigabyte','HP','Lenovo','Dell','Acer',
    'AMD','Intel','NVIDIA','Corsair','Kingston','WD','Seagate','SanDisk',
    'Logitech','Razer','HyperX','SteelSeries','Redragon','JBL','Sony','Beats',
    'AOC','LG','Samsung','Philips','Xiaomi','Nintendo','PlayStation','Xbox',
    'DJI','GoPro','Canon','Nikon','Anker','Baseus','TCL','Hisense'
  ]
  return brands.find(b => (name || '').toLowerCase().includes(b.toLowerCase())) || 'Genérico'
}

// ── Slugify ──────────────────────────────────────────────────────────────────
function slugify(text) {
  return (text || '').toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 90)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Verificar que existe el archivo
  if (!fs.existsSync('atacado-productos.json')) {
    console.error('❌ No encontré atacado-productos.json')
    console.log('   Primero corré el scraper en el navegador de atacadoconnect.com')
    process.exit(1)
  }

  const raw = fs.readFileSync('atacado-productos.json', 'utf8')
  const products = JSON.parse(raw)
  console.log(`\n🚀 Importando ${products.length} productos de Atacado Connect...\n`)

  // Obtener tipo de cambio actual
  const exchangeRate = await getExchangeRate()
  console.log(`📊 Margen aplicado: +${MARKUP * 100}%`)
  console.log(`💱 Precio final = USD × ${exchangeRate} × 1.${MARKUP * 100}\n`)

  // Categorías únicas
  const catNames = [...new Set(products.map(p => mapCategory(p.categoria)))]
  catNames.push('Televisores', 'Audio', 'Tablets', 'Smartwatches', 'Cámaras', 'Drones')
  const uniqueCats = [...new Set(catNames)]

  const catMap = {}
  for (const name of uniqueCats) {
    const slug = slugify(name)
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    })
    catMap[name] = cat.id
  }
  console.log(`✓ ${Object.keys(catMap).length} categorías listas\n`)

  let ok = 0, skip = 0
  const usedSlugs = new Set()

  for (const p of products) {
    try {
      if (!p.name || p.price <= 0) { skip++; continue }

      const catName = mapCategory(p.categoria)
      const categoryId = catMap[catName]
      if (!categoryId) { skip++; continue }

      // Calcular precio con margen
      const priceUSD = parseFloat(p.price_usd || p.price) || 0
      const priceGs = Math.round(priceUSD * exchangeRate * (1 + MARKUP))
      const priceUSDFinal = parseFloat((priceUSD * (1 + MARKUP)).toFixed(2))

      const brand = getBrand(p.name)
      const pcBuilderSlot = getPCSlot(p.name, p.categoria)

      let slug = slugify(p.name)
      if (usedSlugs.has(slug)) {
        slug = slug + '-' + (p.code ? p.code.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 8) : Math.random().toString(36).substring(2, 6))
      }
      usedSlugs.add(slug)

      await prisma.product.upsert({
        where: { slug },
        update: {
          price: priceGs,
          oldPrice: null,
          images: p.image ? [p.image] : [],
          specs: { priceUSD: priceUSDFinal, exchangeRate, sku: p.code || '' },
        },
        create: {
          name: p.name,
          slug,
          brand,
          sku: p.code || null,
          price: priceGs,        // Precio en Gs (para mostrar en la tienda)
          oldPrice: null,
          stock: 15,
          images: p.image ? [p.image] : [],
          description: '',
          categoryId,
          pcBuilderSlot: pcBuilderSlot || null,
          featured: false,
          status: 'ACTIVE',
          specs: {
            priceUSD: priceUSDFinal,    // Precio en USD con margen (para mostrar)
            priceUSDBase: priceUSD,     // Precio original USD sin margen (interno)
            exchangeRate,               // Tipo de cambio usado
            sku: p.code || '',
          },
        }
      })
      ok++
      if (ok % 50 === 0) console.log(`  [${Math.round((ok / products.length) * 100)}%] ${ok} importados...`)
    } catch (e) {
      skip++
      if (skip <= 3) console.log(`  ⚠ Error en "${(p.name || '').substring(0, 40)}": ${e.message}`)
    }
  }

  console.log(`\n✅ COMPLETADO`)
  console.log(`   ✓ ${ok} productos importados`)
  console.log(`   ✗ ${skip} omitidos`)
  console.log(`\n💡 Ahora los precios se muestran en USD y Gs en tu tienda`)
  console.log(`   Tipo de cambio guardado: 1 USD = Gs. ${exchangeRate.toLocaleString('es-PY')}`)

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); prisma.$disconnect() })
