/**
 * PASO 1: Parsear el HTML descargado de Atacado
 * Uso: node parse-html.js
 */
const fs = require('fs')
const path = require('path')

// Buscar el archivo HTML
let htmlFile = null
const downloads = process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'Downloads') : '.'
const candidates = [
  './productos.html',
  './atacado.html',
  path.join(downloads, 'productos_*.html'),
]

// Buscar en directorio actual
const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && (f.includes('producto') || f.includes('atacado')))
if (files.length > 0) htmlFile = files[0]

if (!htmlFile) {
  console.error('❌ No encontré el archivo HTML.')
  console.log('   Copiá el HTML a la carpeta del proyecto y renombralo a: productos.html')
  process.exit(1)
}

console.log(`📄 Procesando: ${htmlFile}`)
const html = fs.readFileSync(htmlFile, 'utf-8')

const products = []
const seen = new Set()

// Extraer imágenes con código
const imgMatches = [...html.matchAll(/src="(https:\/\/cdn\.atacadoconnect\.com\/produtos\/(\d+)\/[^"]+)"/g)]
const priceMatches = [...html.matchAll(/class="producto-precio"[^>]*>\s*U\$\s*([\d.]+,\d{2})/g)]
const nameMatches  = [...html.matchAll(/class="producto-nombre"[^>]*>\s*([^<\n]+?)\s*<\/div>/g)]

console.log(`  Imágenes: ${imgMatches.length}`)
console.log(`  Precios:  ${priceMatches.length}`)
console.log(`  Nombres:  ${nameMatches.length}`)

const SKIP_NAMES = ['OUTLET', 'Sin imagen', 'outlet']

imgMatches.forEach((m, idx) => {
  const imgUrl = m[1]
  const code   = m[2]
  if (seen.has(code)) return
  seen.add(code)

  let name = nameMatches[idx] ? nameMatches[idx][1].trim() : ''
  if (!name || SKIP_NAMES.includes(name) || /^\d+$/.test(name) || name.length < 4) {
    // Usar slug de la URL como nombre
    const slug = imgUrl.split('/').pop().replace(/\.[^.]+$/, '').replace(/-\w{5}$/, '').replace(/-/g, ' ')
    name = slug.substring(0, 80) || `Producto ${code}`
  }

  let price = 0
  if (priceMatches[idx]) {
    try { price = parseFloat(priceMatches[idx][1].replace(/\./g, '').replace(',', '.')) } catch(_) {}
  }

  products.push({ code, name, price_usd: price, image: imgUrl })
})

console.log(`\n✓ ${products.length} productos extraídos`)
console.log(`✓ Con precio: ${products.filter(p => p.price_usd > 0).length}`)
console.log(`✓ Con imagen: ${products.filter(p => p.image).length}`)

// Muestra
console.log('\nEjemplos:')
products.slice(0, 5).forEach(p => 
  console.log(`  ${p.code} | ${p.name.substring(0,45)} | $${p.price_usd}`)
)

fs.writeFileSync('./atacado-html-products.json', JSON.stringify(products, null, 2))
console.log(`\n✅ Guardado en: atacado-html-products.json`)
console.log(`   Ahora corré: node import-atacado-html.js`)
