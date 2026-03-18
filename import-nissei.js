/**
 * IMPORTAR 1804 PRODUCTOS NISSEI → TECNOVATE
 * Ejecutar con: node import-nissei.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

function slugify(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').trim()
    .replace(/\s+/g, '-').replace(/-+/g, '-')
    .substring(0, 90);
}

function getBrand(name) {
  const brands = ['ASUS','MSI','Gigabyte','HP','Lenovo','Dell','Acer','Apple','Samsung',
    'LG','AMD','Intel','NVIDIA','Corsair','Kingston','WD','Western Digital','Seagate',
    'Logitech','Razer','HyperX','AOC','Alienware','Xiaomi','ROG','UGreen','TP-Link',
    'D-Link','Epson','Canon','Brother','Noctua','Cooler Master','Thermaltake','EVGA',
    'Crucial','G.Skill','Patriot','PNY','Zotac','PowerColor','Sapphire','XFX',
    'Motorola','Huawei','Redmi','OnePlus','Sony','Garmin','Amazfit','Philips'];
  return brands.find(b => name.toLowerCase().includes(b.toLowerCase())) || 'Genérico';
}

function getCategory(cat, name) {
  const n = name.toLowerCase();
  if (cat.includes('notebook-gamer') || n.includes('notebook gamer') || 
      n.includes('rog ') || n.includes('tuf gaming') || n.includes('predator') || 
      n.includes('omen ') || n.includes('legion ') || n.includes('victus') ||
      n.includes('crosshair') || n.includes('helios')) return 'Gaming';
  if (cat.includes('notebook') || cat.includes('macbook') || cat.includes('desktop') ||
      n.includes('notebook') || n.includes('macbook')) return 'Notebooks';
  if (cat.includes('tarjetas-graficas') || cat.includes('procesadores') || 
      cat.includes('placas-madres') || cat.includes('memorias') || 
      cat.includes('ssd') || cat.includes('discos') || cat.includes('gabinetes') ||
      cat.includes('coolers') || cat.includes('fuentes')) return 'Componentes';
  if (cat.includes('monitores')) return 'Monitores';
  if (cat.includes('teclados') || cat.includes('audio') || cat.includes('sillas')) return 'Gaming';
  if (cat.includes('iphones') || cat.includes('telefonos')) return 'Celulares';
  if (cat.includes('smart-watches')) return 'Accesorios';
  if (cat.includes('routers')) return 'Networking';
  if (cat.includes('impresoras')) return 'Impresoras';
  if (cat.includes('pendrives')) return 'Accesorios';
  return 'Accesorios';
}

function getPCSlot(cat, name) {
  const n = name.toLowerCase();
  if (cat.includes('procesadores') || n.includes('procesador ') || 
      (n.includes('ryzen ') && !n.includes('notebook') && !n.includes('ryzen ai')) || 
      (n.includes('core i') && !n.includes('notebook') && !n.includes('intel core i') && cat.includes('procesadores'))) return 'CPU';
  if (cat.includes('placas-madres') || n.includes('placa madre')) return 'MOTHERBOARD';
  if (cat.includes('tarjetas-graficas') || n.includes('tarjeta gr')) return 'GPU';
  if (cat.includes('memorias-ram') || (n.includes('memoria') && n.includes('ram'))) return 'RAM';
  if (cat.includes('ssd') || (cat.includes('discos-duros') && n.includes('ssd'))) return 'STORAGE';
  if (cat.includes('fuentes-de-alimentacion') || n.includes('fuente de alimentacion')) return 'PSU';
  if (cat.includes('gabinetes') && !n.includes('notebook')) return 'CASE';
  if (cat.includes('coolers') || n.includes('cooler') || n.includes('disipador')) return 'COOLING';
  return null;
}

function isFeatured(name) {
  const n = name.toLowerCase();
  return n.includes('rtx 50') || n.includes('rtx 40') || n.includes('iphone 15') || 
         n.includes('iphone 16') || n.includes('rog ') || n.includes('ryzen 9') || 
         n.includes('core ultra 9') || n.includes('oled') || n.includes('4k') ||
         n.includes('macbook pro');
}

function extractSocket(name) {
  const n = name.toLowerCase();
  if (n.includes('am5')) return 'AM5';
  if (n.includes('am4')) return 'AM4';
  if (n.includes('lga1700') || n.includes('lga 1700') || n.includes('1700')) {
    if (n.includes('placa') || n.includes('procesador')) return 'LGA1700';
  }
  if (n.includes('lga1851') || n.includes('lga 1851') || n.includes('1851')) return 'LGA1851';
  return null;
}

function extractWattage(name) {
  const n = name.toLowerCase();
  const wMatch = n.match(/(\d+)\s*w\b/);
  if (wMatch && n.includes('fuente')) return parseInt(wMatch[1]);
  if (n.includes('rtx 4090') || n.includes('rtx 5090')) return 450;
  if (n.includes('rtx 4080') || n.includes('rtx 5080')) return 320;
  if (n.includes('rtx 4070') || n.includes('rtx 5070')) return 250;
  if (n.includes('rtx 4060') || n.includes('rtx 5060')) return 165;
  if (n.includes('rx 7900')) return 355;
  if (n.includes('rx 7800') || n.includes('rx 7700')) return 250;
  if (n.includes('ryzen 9') || n.includes('core ultra 9')) return 125;
  if (n.includes('ryzen 7') || n.includes('core i7') || n.includes('core ultra 7')) return 105;
  if (n.includes('ryzen 5') || n.includes('core i5') || n.includes('core ultra 5')) return 65;
  return null;
}

async function main() {
  const raw = fs.readFileSync('todos-nissei.json', 'utf8');
  const products = JSON.parse(raw);
  console.log(`\n🚀 Importando ${products.length} productos de Nissei...\n`);

  // Crear/obtener categorías
  const catNames = ['Gaming', 'Notebooks', 'Componentes', 'Monitores', 'Celulares', 
                    'Accesorios', 'Networking', 'Impresoras'];
  const catMap = {};
  for (const name of catNames) {
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g,'-');
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug }
    });
    catMap[name] = cat.id;
  }
  console.log('✓ Categorías listas\n');

  let ok = 0, skip = 0, dup = 0;
  const usedSlugs = new Set();

  // Cargar en lotes de 50
  const BATCH = 50;
  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    
    for (const p of batch) {
      try {
        const catName = getCategory(p.categoria || '', p.name);
        const categoryId = catMap[catName];
        const brand = getBrand(p.name);
        const pcBuilderSlot = getPCSlot(p.categoria || '', p.name);
        const socket = extractSocket(p.name);
        const wattage = extractWattage(p.name);
        const featured = isFeatured(p.name);

        let slug = slugify(p.name);
        if (usedSlugs.has(slug)) {
          slug = slug + '-' + Math.random().toString(36).substring(2,6);
        }
        usedSlugs.add(slug);

        await prisma.product.upsert({
          where: { slug },
          update: { 
            price: p.price, 
            oldPrice: p.oldPrice,
            images: p.image ? [p.image] : [],
          },
          create: {
            name: p.name,
            slug,
            brand,
            price: p.price,
            oldPrice: p.oldPrice || null,
            stock: 10,
            images: p.image ? [p.image] : [],
            description: '',
            categoryId,
            pcBuilderSlot: pcBuilderSlot || null,
            socket: socket || null,
            wattage: wattage || null,
            featured,
            status: 'ACTIVE',
            specs: {},
          }
        });
        ok++;
      } catch(e) {
        skip++;
        if (skip <= 5) console.log(`  ⚠ Error: ${p.name.substring(0,50)} — ${e.message}`);
      }
    }
    
    const pct = Math.round(((i + BATCH) / products.length) * 100);
    console.log(`  [${Math.min(pct,100)}%] ${ok} importados, ${skip} errores...`);
  }

  console.log(`\n✅ COMPLETADO`);
  console.log(`   ✓ ${ok} productos importados exitosamente`);
  console.log(`   ✗ ${skip} productos con error`);
  console.log(`\n🌐 Ya podés ver los productos en tu tienda!`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); prisma.$disconnect(); });
