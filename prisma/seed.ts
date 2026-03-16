/**
 * SEED — Datos iniciales para Tecnovate
 * Ejecutar con: npx ts-node prisma/seed.ts
 * O agregar a package.json: "prisma": { "seed": "ts-node prisma/seed.ts" }
 * Y correr: npx prisma db seed
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // ── Categorías ──────────────────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: 'notebooks' }, update: {}, create: { name: 'Notebooks', slug: 'notebooks', icon: '💻' } }),
    prisma.category.upsert({ where: { slug: 'componentes' }, update: {}, create: { name: 'Componentes PC', slug: 'componentes', icon: '🖥️' } }),
    prisma.category.upsert({ where: { slug: 'gaming' }, update: {}, create: { name: 'Gaming', slug: 'gaming', icon: '🎮' } }),
    prisma.category.upsert({ where: { slug: 'celulares' }, update: {}, create: { name: 'Celulares', slug: 'celulares', icon: '📱' } }),
    prisma.category.upsert({ where: { slug: 'monitores' }, update: {}, create: { name: 'Monitores', slug: 'monitores', icon: '🖥' } }),
    prisma.category.upsert({ where: { slug: 'accesorios' }, update: {}, create: { name: 'Accesorios', slug: 'accesorios', icon: '🖱️' } }),
  ])
  console.log(`✓ ${categories.length} categorías creadas`)

  // ── Usuario admin ────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tecnovate.com.py' },
    update: {},
    create: {
      name: 'Admin Tecnovate',
      email: 'admin@tecnovate.com.py',
      password: adminPassword,
      role: 'ADMIN',
    },
  })
  console.log(`✓ Admin creado: ${admin.email} / contraseña: admin123`)

  // ── Productos de ejemplo ─────────────────────────────────────────────────────
  const [compCat, gamingCat, notebookCat, celularCat] = [
    categories[1], categories[2], categories[0], categories[3]
  ]

  const products = [
    {
      name: 'AMD Ryzen 7 7700X Procesador AM5',
      slug: 'amd-ryzen-7-7700x',
      brand: 'AMD', sku: 'CPU-R77700X',
      price: 890000, stock: 8,
      categoryId: compCat.id,
      pcBuilderSlot: 'CPU' as any,
      wattage: 105, socket: 'AM5',
      images: [], featured: true, status: 'ACTIVE' as any,
      specs: { Núcleos: '8', Hilos: '16', 'Frecuencia base': '4.5 GHz', 'Frecuencia boost': '5.4 GHz', TDP: '105W', Socket: 'AM5' },
    },
    {
      name: 'MSI MAG X670E Tomahawk WiFi',
      slug: 'msi-mag-x670e-tomahawk',
      brand: 'MSI', sku: 'MB-X670E-TH',
      price: 850000, stock: 5,
      categoryId: compCat.id,
      pcBuilderSlot: 'MOTHERBOARD' as any,
      wattage: 30, socket: 'AM5',
      images: [], status: 'ACTIVE' as any,
      specs: { Socket: 'AM5', Chipset: 'X670E', 'Slots RAM': '4x DDR5', 'PCIe': 'PCIe 5.0', WiFi: '6E', USB: 'USB 3.2 Gen2' },
    },
    {
      name: 'NVIDIA GeForce RTX 4070 Super 12GB',
      slug: 'rtx-4070-super',
      brand: 'NVIDIA', sku: 'GPU-4070S',
      price: 2100000, oldPrice: 2400000, stock: 4,
      categoryId: compCat.id,
      pcBuilderSlot: 'GPU' as any,
      wattage: 220,
      images: [], featured: true, status: 'ACTIVE' as any,
      specs: { VRAM: '12GB GDDR6X', 'CUDA Cores': '7168', 'Ray Tracing': 'Sí', DLSS: '3.0', 'TDP': '220W', Puerto: 'PCIe 4.0 x16' },
    },
    {
      name: 'Corsair Vengeance DDR5 32GB 6000MHz',
      slug: 'corsair-ddr5-32gb',
      brand: 'Corsair', sku: 'RAM-DDR5-32',
      price: 420000, stock: 12,
      categoryId: compCat.id,
      pcBuilderSlot: 'RAM' as any,
      wattage: 8,
      images: [], status: 'ACTIVE' as any,
      specs: { Capacidad: '32GB (2x16GB)', Tipo: 'DDR5', Velocidad: '6000MHz', CL: 'CL36', RGB: 'Sí' },
    },
    {
      name: 'Samsung 990 Pro 1TB NVMe M.2',
      slug: 'samsung-990-pro-1tb',
      brand: 'Samsung', sku: 'SSD-990PRO-1T',
      price: 380000, stock: 15,
      categoryId: compCat.id,
      pcBuilderSlot: 'STORAGE' as any,
      wattage: 6,
      images: [], status: 'ACTIVE' as any,
      specs: { Capacidad: '1TB', Interfaz: 'PCIe 4.0 NVMe', 'Lectura seq.': '7450 MB/s', 'Escritura seq.': '6900 MB/s', Factor: 'M.2 2280' },
    },
    {
      name: 'Corsair RM850x 850W 80+ Gold',
      slug: 'corsair-rm850x',
      brand: 'Corsair', sku: 'PSU-RM850X',
      price: 420000, stock: 7,
      categoryId: compCat.id,
      pcBuilderSlot: 'PSU' as any,
      wattage: 0,
      images: [], status: 'ACTIVE' as any,
      specs: { Potencia: '850W', Certificación: '80+ Gold', Modular: 'Totalmente modular', Fan: '135mm', Garantía: '10 años' },
    },
    {
      name: 'ASUS ROG Strix G16 RTX 4060 i9',
      slug: 'asus-rog-strix-g16',
      brand: 'ASUS', sku: 'NB-ROG-G16',
      price: 3800000, oldPrice: 4200000, stock: 3,
      categoryId: notebookCat.id,
      images: [], featured: true, status: 'ACTIVE' as any,
      specs: { CPU: 'Intel i9-13980HX', GPU: 'RTX 4060 8GB', RAM: '16GB DDR5', Almacenamiento: '512GB NVMe', Pantalla: '16" 165Hz QHD', OS: 'Windows 11' },
    },
    {
      name: 'LG UltraGear 27" 4K 144Hz IPS',
      slug: 'lg-ultragear-27-4k',
      brand: 'LG', sku: 'MON-LG27-4K',
      price: 1600000, oldPrice: 1850000, stock: 6,
      categoryId: gamingCat.id,
      images: [], featured: true, status: 'ACTIVE' as any,
      specs: { Tamaño: '27"', Resolución: '4K UHD', 'Tasa de refresco': '144Hz', 'Tiempo de respuesta': '1ms', Panel: 'IPS', HDR: 'HDR600', Puerto: 'HDMI 2.1, DP 1.4' },
    },
    {
      name: 'iPhone 15 Pro 256GB Titanio',
      slug: 'iphone-15-pro-256',
      brand: 'Apple', sku: 'CEL-IP15PRO',
      price: 4500000, stock: 5,
      categoryId: celularCat.id,
      images: [], featured: true, status: 'ACTIVE' as any,
      specs: { Chip: 'A17 Pro', Pantalla: '6.1" Super Retina XDR', Cámara: '48MP + 12MP + 12MP', Batería: '3274 mAh', USB: 'USB-C 3.0', '5G': 'Sí' },
    },
    {
      name: 'Logitech G Pro X TKL Teclado Mecánico',
      slug: 'logitech-gpro-x-tkl',
      brand: 'Logitech', sku: 'TEC-GPROX',
      price: 580000, stock: 10,
      categoryId: gamingCat.id,
      images: [], status: 'ACTIVE' as any,
      specs: { Switches: 'GX Red Linear', Layout: 'TKL (87 teclas)', RGB: 'LIGHTSYNC RGB', Conexión: 'USB + Bluetooth + 2.4GHz', Batería: '40h wireless' },
    },
  ]

  let created = 0
  for (const p of products) {
    try {
      await prisma.product.upsert({
        where: { slug: p.slug },
        update: {},
        create: p as any,
      })
      created++
    } catch (e) {
      console.warn(`  ⚠ Saltando ${p.name}: ya existe o error`)
    }
  }
  console.log(`✓ ${created}/${products.length} productos creados`)

  console.log('\n🎉 Seed completado!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Admin: admin@tecnovate.com.py')
  console.log('Pass:  admin123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
