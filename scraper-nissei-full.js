/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║         TECNOVATE — Scraper Nissei → BD                     ║
 * ║                                                              ║
 * ║  Instalar dependencias primero:                              ║
 * ║    npm install puppeteer-core @sparticuz/chromium            ║
 * ║  O con puppeteer completo:                                   ║
 * ║    npm install puppeteer                                     ║
 * ║                                                              ║
 * ║  Correr:  node scraper-nissei-full.js                        ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { PrismaClient } = require('@prisma/client')
const https = require('https')
const fs    = require('fs')

const prisma     = new PrismaClient()
const DESCUENTO  = 0.05          // 5% — precio final = nissei * 0.95
const DELAY_MS   = 600           // delay entre requests
const OUT_FILE   = 'nissei-productos.json'

// ── Cotización dólar (actualizá según el día) ──────────────────────
const USD_RATE = 7900            // 1 USD = 7900 Gs aprox

// ── Categorías de Nissei ──────────────────────────────────────────
const CATEGORIAS = [
  // Notebooks
  { url: 'informatica/notebooks/notebook-gamer',                       cat: 'Gaming',      slot: null },
  { url: 'informatica/notebooks/notebooks-para-trabajar',              cat: 'Notebooks',   slot: null },
  { url: 'informatica/notebooks/notebooks-2-en-1',                     cat: 'Notebooks',   slot: null },
  // Componentes
  { url: 'informatica/componentes/procesadores-cpu',                   cat: 'Componentes', slot: 'CPU' },
  { url: 'informatica/accesorios-y-componentes/tarjetas-graficas',     cat: 'Componentes', slot: 'GPU' },
  { url: 'informatica/accesorios-y-componentes/memorias-ram',          cat: 'Componentes', slot: 'RAM' },
  { url: 'informatica/accesorios-y-componentes/placas-madres',         cat: 'Componentes', slot: 'MOTHERBOARD' },
  { url: 'informatica/accesorios-y-componentes/fuentes-de-alimentacion', cat: 'Componentes', slot: 'PSU' },
  { url: 'informatica/accesorios-y-componentes/gabinetes',             cat: 'Componentes', slot: 'CASE' },
  { url: 'informatica/componentes/discos-duros/ssd',                   cat: 'Componentes', slot: 'STORAGE' },
  { url: 'informatica/accesorios-y-componentes/coolers',               cat: 'Componentes', slot: 'COOLING' },
  // Celulares
  { url: 'electronica/celulares-tabletas/celulares-accesorios/telefonos-inteligentes', cat: 'Celulares', slot: null },
  { url: 'electronica/celulares-tabletas/celulares-accesorios/iphones', cat: 'Celulares', slot: null },
  // Monitores
  { url: 'informatica/accesorios-y-componentes/monitores/monitores-planos', cat: 'Monitores', slot: null },
  { url: 'informatica/accesorios-y-componentes/monitores/curvo',            cat: 'Monitores', slot: null },
  // Accesorios
  { url: 'informatica/accesorios-y-componentes/teclados',              cat: 'Accesorios',  slot: null },
  { url: 'informatica/accesorios-y-componentes/mouses',                cat: 'Accesorios',  slot: null },
  { url: 'informatica/accesorios-y-componentes/auriculares',           cat: 'Accesorios',  slot: null },
  { url: 'informatica/accesorios-y-componentes/sillas-gamer',          cat: 'Accesorios',  slot: null },
  // Networking
  { url: 'informatica/redes/routers',                                  cat: 'Networking',  slot: null },
  { url: 'informatica/redes/switches',                                  cat: 'Networking',  slot: null },
  // Impresoras
  { url: 'informatica/impresoras',                                     cat: 'Impresoras',  slot: null },
]

// ── Helpers ────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 80)
}

function fetchJSON(url) {
  return new Promise((resolve) => {
    const opts = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120',
        'Accept': 'application/json, */*',
        'Accept-Language': 'es-PY,es;q=0.9',
        'Referer': 'https://nissei.com/py',
        'X-Requested-With': 'XMLHttpRequest',
      }
    }
    https.get(url, opts, res => {
      let data = ''
      res.on('data', c => data += c)
      res.on('end', () => {
        try { resolve(JSON.parse(data)) }
        catch { resolve(null) }
      })
    }).on('error', () => resolve(null))
  })
}

function detectarMarca(nombre) {
  const marcas = [
    'Apple','Samsung','Xiaomi','Motorola','Huawei','OPPO','Realme','OnePlus',
    'ASUS','ROG','MSI','Acer','Lenovo','HP','Dell','Toshiba','LG','Sony',
    'AMD','Intel','NVIDIA','Corsair','Kingston','Crucial','WD','Seagate',
    'Gigabyte','EVGA','Sapphire','Zotac','Palit','Adata',
    'Logitech','Razer','HyperX','SteelSeries','Redragon',
    'TP-Link','D-Link','Netgear','Ubiquiti','Mikrotik','Tenda',
    'Epson','Canon','Brother','Ricoh',
    'Garmin','Amazfit','Polar',
    'Cooler Master','NZXT','Lian Li','Fractal','be quiet',
    'Thermaltake','Deepcool','Arctic',
    'Tilta','Godox','Rode',
  ]
  const n = nombre.toLowerCase()
  return marcas.find(m => n.includes(m.toLowerCase())) || nombre.split(' ')[0]
}

// ── Obtener lista de productos de una categoría ────────────────────
async function getProductList(catUrl) {
  const catKey = catUrl.split('/').pop()
  
  // Intento 1: API REST de Magento 2
  const apiUrl = `https://nissei.com/py/rest/V1/products?` +
    `searchCriteria[filter_groups][0][filters][0][field]=category_url_key&` +
    `searchCriteria[filter_groups][0][filters][0][value]=${catKey}&` +
    `searchCriteria[filter_groups][0][filters][0][condition_type]=eq&` +
    `searchCriteria[pageSize]=100&` +
    `fields=items[id,sku,name,price,media_gallery_entries,custom_attributes,status,extension_attributes]`
  
  const data = await fetchJSON(apiUrl)
  if (data?.items?.length > 0) return data.items

  // Intento 2: por category_id
  const catData = await fetchJSON(
    `https://nissei.com/py/rest/V1/categories?searchCriteria[filter_groups][0][filters][0][field]=url_key&searchCriteria[filter_groups][0][filters][0][value]=${catKey}`
  )
  if (!catData?.items?.[0]) return []

  const catId = catData.items[0].id
  const prods = await fetchJSON(
    `https://nissei.com/py/rest/V1/products?` +
    `searchCriteria[filter_groups][0][filters][0][field]=category_id&` +
    `searchCriteria[filter_groups][0][filters][0][value]=${catId}&` +
    `searchCriteria[pageSize]=100&` +
    `fields=items[id,sku,name,price,media_gallery_entries,custom_attributes,status]`
  )
  return prods?.items || []
}

// ── Obtener detalle de un producto (descripción, specs) ────────────
async function getProductDetail(sku) {
  const data = await fetchJSON(`https://nissei.com/py/rest/V1/products/${encodeURIComponent(sku)}`)
  return data
}

// ── Procesar item de Magento → formato Tecnovate ──────────────────
function procesarProducto(item, catInfo, detail) {
  const precioOriginal = parseFloat(item.price) || 0
  const precio         = Math.round(precioOriginal * (1 - DESCUENTO))

  // Descripción
  const getAttr = (obj, code) => {
    const a = obj?.custom_attributes?.find(x => x.attribute_code === code)
    return a?.value || ''
  }

  const descripcion = (
    getAttr(detail || item, 'description') ||
    getAttr(detail || item, 'short_description') || ''
  ).replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim().substring(0, 1000)

  // Imágenes
  const imagenes = (item.media_gallery_entries || detail?.media_gallery_entries || [])
    .filter(e => !e.disabled && e.media_type === 'image')
    .slice(0, 6)
    .map(e => `https://nissei.com/media/catalog/product${e.file}`)

  // Specs desde custom_attributes
  const SPEC_ATTRS = [
    'color','manufacturer','capacity','processor_type','ram_memory',
    'storage_capacity','screen_size','resolution','battery_capacity',
    'connectivity','operating_system','graphics_card','weight',
    'dimensions','warranty','interface','part_number','upc',
  ]
  const specs = {}
  ;(detail?.custom_attributes || item.custom_attributes || []).forEach(attr => {
    if (SPEC_ATTRS.includes(attr.attribute_code) && attr.value) {
      const label = attr.attribute_code
        .replace(/_/g, ' ')
        .replace(/\b\w/g, c => c.toUpperCase())
      specs[label] = String(attr.value)
    }
  })

  // Socket y wattage para PC Builder
  const nombre = item.name || ''
  const socket  = nombre.match(/\bAM[45]\b|\bLGA\d+\b|\bFM\d\b/i)?.[0] || null
  const wattage = parseInt(nombre.match(/(\d+)\s*W\b/i)?.[1] || '0') || null

  return {
    name:          nombre,
    sku:           item.sku || null,
    brand:         detectarMarca(nombre),
    price:         precio,
    oldPrice:      null,   // sin mostrar precio anterior — el descuento es interno
    priceUsd:      Math.round(precio / USD_RATE * 100) / 100,
    stock:         10,
    images:        imagenes,
    description:   descripcion,
    categoryName:  catInfo.cat,
    pcBuilderSlot: catInfo.slot,
    socket,
    wattage,
    featured:      false,
    specs,
  }
}

// ── Main ──────────────────────────────────────────────────────────
async function main() {
  console.log('╔═══════════════════════════════════════════════════╗')
  console.log('║  TECNOVATE — Scraper Nissei.com/py                ║')
  console.log('╚═══════════════════════════════════════════════════╝\n')

  const allProducts  = []
  const usedSlugs    = new Set()
  let totalOk        = 0
  let totalSkip      = 0

  for (const cat of CATEGORIAS) {
    process.stdout.write(`📦 ${cat.cat} / ${cat.url.split('/').pop()}... `)

    const items = await getProductList(cat.url)

    if (items.length === 0) {
      console.log('⚠ Sin productos (API bloqueada o categoría vacía)')
      await sleep(DELAY_MS)
      continue
    }

    let catOk = 0
    for (const item of items) {
      if (!item.name || !item.price || item.status !== 1) continue
      try {
        // Obtener detalle para descripción y specs más completos
        await sleep(200)
        const detail = await getProductDetail(item.sku)

        const producto = procesarProducto(item, cat, detail)

        // Slug único
        let slug = slugify(producto.name)
        if (usedSlugs.has(slug)) slug = slug + '-' + Math.random().toString(36).substring(2, 5)
        usedSlugs.add(slug)
        producto.slug = slug

        allProducts.push(producto)
        catOk++
        totalOk++
      } catch {
        totalSkip++
      }
    }

    console.log(`✓ ${catOk} productos`)
    await sleep(DELAY_MS)
  }

  console.log(`\n📊 Total: ${totalOk} productos, ${totalSkip} errores`)

  if (allProducts.length === 0) {
    console.log('\n⚠  La API de Nissei está bloqueando los requests.')
    console.log('   Usá el método manual con DevTools (ver README).')
    return
  }

  // Guardar JSON para revisar
  fs.writeFileSync(OUT_FILE, JSON.stringify(allProducts, null, 2))
  console.log(`\n✅ Guardado en: ${OUT_FILE}`)
  console.log('   Revisá el archivo y luego corré: node import-nissei-full.js')

  await prisma.$disconnect()
}

main().catch(async e => {
  console.error(e)
  await prisma.$disconnect()
})
