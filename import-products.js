
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
          data: { name: p.categoryName, slug: p.categoryName.toLowerCase().replace(/\s+/g, '-') }
        });
      }
      
      const slug = p.name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '').trim()
        .replace(/\s+/g, '-').substring(0, 80);
      
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
  
  console.log('\n✓ Completado: ' + ok + ' importados, ' + skip + ' errores');
  await prisma.$disconnect();
}

importProducts().catch(console.error);
