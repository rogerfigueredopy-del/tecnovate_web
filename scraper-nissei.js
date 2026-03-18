/**
 * SCRAPER NISSEI → TECNOVATE
 * Obtiene productos de nissei.com/py y los carga en tu BD
 * Ejecutar con: node scraper-nissei.js
 */

const https = require('https');
const { execSync } = require('child_process');

// ── Configuración ────────────────────────────────────────────────────────────
const DESCUENTO = 0.05; // 5% de descuento sobre precio Nissei
const DELAY_MS = 800;   // Espera entre requests para no saturar

// Categorías de Nissei con sus URLs
const CATEGORIAS = [
  { nissei: 'informatica/notebooks/notebook-gamer',            local: 'Gaming',       slot: null },
  { nissei: 'informatica/notebooks/notebooks-para-trabajar',   local: 'Notebooks',    slot: null },
  { nissei: 'informatica/componentes/procesadores-cpu',        local: 'Componentes',  slot: 'CPU' },
  { nissei: 'informatica/accesorios-y-componentes/tarjetas-graficas', local: 'Componentes', slot: 'GPU' },
  { nissei: 'informatica/accesorios-y-componentes/memorias-ram',      local: 'Componentes', slot: 'RAM' },
  { nissei: 'informatica/accesorios-y-componentes/placas-madres',     local: 'Componentes', slot: 'MOTHERBOARD' },
  { nissei: 'informatica/accesorios-y-componentes/fuentes-de-alimentacion', local: 'Componentes', slot: 'PSU' },
  { nissei: 'informatica/accesorios-y-componentes/gabinetes',         local: 'Componentes', slot: 'CASE' },
  { nissei: 'informatica/componentes/discos-duros/ssd',               local: 'Componentes', slot: 'STORAGE' },
  { nissei: 'informatica/accesorios-y-componentes/monitores/curvo',   local: 'Monitores',   slot: null },
  { nissei: 'electronica/celulares-tabletas/celulares-accesorios/telefonos-inteligentes', local: 'Celulares', slot: null },
  { nissei: 'electronica/celulares-tabletas/celulares-accesorios/iphones', local: 'Celulares', slot: null },
  { nissei: 'informatica/accesorios-y-componentes/monitores/teclados', local: 'Gaming', slot: null },
  { nissei: 'informatica/accesorios-y-componentes/componentes/coolers', local: 'Componentes', slot: 'COOLING' },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim().replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 80);
}

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-PY,es;q=0.9',
        'Referer': 'https://nissei.com/py',
      }
    };
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { resolve(null); }
      });
    }).on('error', reject);
  });
}

// Buscar la API de Nissei — usan Magento 2
async function getProductsByCategory(categoryUrl) {
  // Nissei usa Magento 2, la API es /rest/V1/products
  const searchUrl = `https://nissei.com/py/rest/V1/products?` +
    `searchCriteria[filter_groups][0][filters][0][field]=category_url_key&` +
    `searchCriteria[filter_groups][0][filters][0][value]=${categoryUrl.split('/').pop()}&` +
    `searchCriteria[filter_groups][0][filters][0][condition_type]=eq&` +
    `searchCriteria[pageSize]=50&` +
    `fields=items[id,sku,name,price,media_gallery_entries,custom_attributes,status]`;

  const result = await fetchJSON(searchUrl);
  if (result && result.items) return result.items;

  // Si no funciona, intentar con la URL de categoría directa
  const catKey = categoryUrl.split('/').pop();
  const url2 = `https://nissei.com/py/rest/V1/categories?searchCriteria[filter_groups][0][filters][0][field]=url_key&searchCriteria[filter_groups][0][filters][0][value]=${catKey}`;
  const cats = await fetchJSON(url2);
  if (!cats || !cats.items || !cats.items[0]) return [];

  const catId = cats.items[0].id;
  const prodUrl = `https://nissei.com/py/rest/V1/products?` +
    `searchCriteria[filter_groups][0][filters][0][field]=category_id&` +
    `searchCriteria[filter_groups][0][filters][0][value]=${catId}&` +
    `searchCriteria[pageSize]=50&` +
    `fields=items[id,sku,name,price,media_gallery_entries,custom_attributes,status]`;

  const prods = await fetchJSON(prodUrl);
  return prods && prods.items ? prods.items : [];
}

function extractCustomAttr(item, attrCode) {
  if (!item.custom_attributes) return null;
  const attr = item.custom_attributes.find(a => a.attribute_code === attrCode);
  return attr ? attr.value : null;
}

function buildProductData(item, categoria, used_slugs) {
  const originalPrice = parseFloat(item.price) || 0;
  const price = Math.round(originalPrice * (1 - DESCUENTO));
  const oldPrice = Math.round(originalPrice);

  const name = item.name || 'Sin nombre';
  let slug = slugify(name);
  // Evitar slugs duplicados
  if (used_slugs.has(slug)) {
    slug = slug + '-' + item.sku.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 10);
  }
  used_slugs.add(slug);

  const description = extractCustomAttr(item, 'description') || 
                      extractCustomAttr(item, 'short_description') || '';

  // Imágenes
  const images = [];
  if (item.media_gallery_entries) {
    item.media_gallery_entries
      .filter(e => !e.disabled && e.media_type === 'image')
      .slice(0, 6)
      .forEach(e => {
        images.push(`https://nissei.com/media/catalog/product${e.file}`);
      });
  }

  // Extraer marca del nombre
  const brands = ['AMD', 'Intel', 'NVIDIA', 'Samsung', 'Apple', 'ASUS', 'MSI', 
                  'Gigabyte', 'Corsair', 'Kingston', 'Western Digital', 'Seagate',
                  'Logitech', 'Razer', 'HyperX', 'LG', 'Lenovo', 'HP', 'Dell',
                  'Acer', 'Xiaomi', 'Huawei', 'Motorola', 'Sony', 'TP-Link',
                  'D-Link', 'Epson', 'Canon', 'Brother', 'Noctua', 'be quiet'];
  const brand = brands.find(b => name.toLowerCase().includes(b.toLowerCase())) || 
                extractCustomAttr(item, 'manufacturer') || 'Genérico';

  return {
    name,
    slug,
    brand,
    sku: item.sku || null,
    price,
    oldPrice: oldPrice !== price ? oldPrice : null,
    stock: 10,
    images,
    description: description.replace(/<[^>]*>/g, '').substring(0, 500),
    categoryName: categoria.local,
    pcBuilderSlot: categoria.slot,
    status: item.status === 1 ? 'ACTIVE' : 'DRAFT',
    featured: false,
    specs: {},
  };
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Iniciando scraper Nissei → Tecnovate...\n');

  let allProducts = [];
  const usedSlugs = new Set();

  for (const cat of CATEGORIAS) {
    console.log(`📦 Scraping: ${cat.nissei}...`);
    try {
      const items = await getProductsByCategory(cat.nissei);
      if (items.length === 0) {
        console.log(`   ⚠ Sin productos (la API puede estar bloqueada para esta categoría)`);
      } else {
        const products = items
          .filter(item => item.price > 0 && item.status === 1)
          .map(item => buildProductData(item, cat, usedSlugs));
        allProducts.push(...products);
        console.log(`   ✓ ${products.length} productos obtenidos`);
      }
    } catch (e) {
      console.log(`   ✗ Error: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }

  console.log(`\n📊 Total de productos obtenidos: ${allProducts.length}`);

  if (allProducts.length === 0) {
    console.log('\n⚠ Nissei bloquea su API REST pública.');
    console.log('📋 Generando archivo de importación manual...\n');
    generateManualImport();
    return;
  }

  // Guardar en JSON para revisar antes de importar
  const fs = require('fs');
  fs.writeFileSync('productos-nissei.json', JSON.stringify(allProducts, null, 2));
  console.log('\n✓ Productos guardados en: productos-nissei.json');
  console.log('  Revisá el archivo y después corré: node import-products.js');

  // Generar script de importación
  generateImportScript(allProducts);
}

function generateManualImport() {
  const fs = require('fs');
  
  // Crear script de importación que usa Prisma directamente
  const importScript = `
/**
 * IMPORTAR PRODUCTOS MANUALMENTE
 * 1. Completá el array PRODUCTS con los datos de Nissei
 * 2. Corré: node import-products.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// INSTRUCCIONES:
// 1. Andá a nissei.com/py
// 2. En cada categoría, abrí el DevTools (F12) → Network → buscá requests a /rest/V1/products
// 3. Copiá la respuesta JSON
// 4. Pegá los productos en el array de abajo con el formato correcto

const PRODUCTS = [
  // Ejemplo:
  // {
  //   name: 'Notebook ASUS ROG Strix G16',
  //   brand: 'ASUS',
  //   price: 3610000,    // precio Nissei - 5%
  //   oldPrice: 3800000, // precio original Nissei
  //   stock: 5,
  //   images: ['https://nissei.com/media/catalog/product/...jpg'],
  //   description: 'Notebook gaming con RTX 4060...',
  //   categoryName: 'Notebooks',
  //   pcBuilderSlot: null,
  // },
];

async function importProducts() {
  console.log('Importando ' + PRODUCTS.length + ' productos...');
  
  let ok = 0, skip = 0;
  
  for (const p of PRODUCTS) {
    try {
      // Buscar categoría
      let cat = await prisma.category.findFirst({ where: { name: p.categoryName } });
      if (!cat) {
        cat = await prisma.category.create({
          data: { name: p.categoryName, slug: p.categoryName.toLowerCase().replace(/\\s+/g, '-') }
        });
      }
      
      const slug = p.name.toLowerCase()
        .normalize('NFD').replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9\\s-]/g, '').trim()
        .replace(/\\s+/g, '-').substring(0, 80);
      
      await prisma.product.upsert({
        where: { slug },
        update: { price: p.price, oldPrice: p.oldPrice, stock: p.stock },
        create: {
          name: p.name,
          slug,
          brand: p.brand,
          price: p.price,
          oldPrice: p.oldPrice || null,
          stock: p.stock || 10,
          images: p.images || [],
          description: p.description || '',
          categoryId: cat.id,
          pcBuilderSlot: p.pcBuilderSlot || null,
          status: 'ACTIVE',
          featured: p.featured || false,
          specs: p.specs || {},
        }
      });
      ok++;
      if (ok % 10 === 0) console.log('  ' + ok + ' importados...');
    } catch(e) {
      console.log('  Error en ' + p.name + ': ' + e.message);
      skip++;
    }
  }
  
  console.log('\\n✓ Completado: ' + ok + ' importados, ' + skip + ' errores');
  await prisma.$disconnect();
}

importProducts().catch(console.error);
`;

  fs.writeFileSync('import-products.js', importScript);
  console.log('✓ Archivo creado: import-products.js\n');
  console.log('PASOS PARA IMPORTAR PRODUCTOS DE NISSEI:');
  console.log('════════════════════════════════════════');
  console.log('');
  console.log('OPCIÓN A — Automática (recomendada):');
  console.log('1. Abrí Chrome y andá a nissei.com/py');
  console.log('2. Abrí DevTools (F12) → pestaña Network');
  console.log('3. Filtrá por "XHR" o buscá "rest/V1"');
  console.log('4. Navegá a una categoría (ej: Notebooks)');
  console.log('5. Vas a ver requests a la API — copiá las respuestas');
  console.log('');
  console.log('OPCIÓN B — Por el panel admin de Tecnovate:');
  console.log('1. Andá a tecnovate-new.vercel.app/admin/products/new');
  console.log('2. Cargá los productos más importantes uno por uno');
  console.log('3. Las imágenes se suben automáticamente a Cloudinary');
  console.log('');
  console.log('OPCIÓN C — Contactar a Nissei:');
  console.log('Pedirles un feed de productos (CSV/XML) para revendedores.');
  console.log('Muchos mayoristas tienen esto disponible para sus clientes B2B.');
}

function generateImportScript(products) {
  const fs = require('fs');
  const script = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const products = ${JSON.stringify(products, null, 2)};

async function main() {
  let ok = 0;
  for (const p of products) {
    try {
      let cat = await prisma.category.findFirst({ where: { name: p.categoryName } });
      if (!cat) cat = await prisma.category.create({ data: { name: p.categoryName, slug: p.categoryName.toLowerCase().replace(/\\s+/g, '-') } });
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: { price: p.price, stock: p.stock },
        create: { ...p, categoryId: cat.id, categoryName: undefined },
      });
      ok++;
    } catch(e) { console.log('Skip:', p.name, e.message); }
  }
  console.log('✓ ' + ok + '/' + products.length + ' productos importados');
  await prisma.$disconnect();
}
main().catch(console.error);
`;
  fs.writeFileSync('import-products.js', script);
  console.log('✓ Script de importación creado: import-products.js');
  console.log('   Corré: node import-products.js');
}

main().catch(console.error);