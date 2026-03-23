// app/api/admin/import-products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verificarAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${process.env.ADMIN_SECRET}`
}

function slugify(t: string) {
  return t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'').slice(0,100)
}

function extraerBrand(nombre: string) {
  const marcas = ['Apple','Samsung','Xiaomi','Motorola','LG','Sony','Asus','Lenovo','HP','Dell','Acer','MSI','Gigabyte','Intel','AMD','NVIDIA','Corsair','Logitech','Razer','Huawei','Garmin','Amazfit','TCL','ROG','JBL','Kingston','WD']
  for (const m of marcas) if (nombre.toLowerCase().includes(m.toLowerCase())) return m
  return nombre.split(' ')[0] || 'Sin marca'
}

const SLUG_MAP: Record<string,string> = {
  'Celulares':'celulares','Notebooks':'notebooks','Gaming':'gaming',
  'Componentes':'componentes','Monitores':'monitores','Accesorios':'accesorios',
  'Electrónicos':'accesorios','Networking':'accesorios','Impresoras':'accesorios',
}

export async function POST(req: NextRequest) {
  if (!verificarAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  let body: any
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }) }

  const { productos = [], reemplazar = false } = body
  if (!Array.isArray(productos) || !productos.length) return NextResponse.json({ error: 'Sin productos' }, { status: 400 })

  // Cargar categorías de una vez
  let cats = await prisma.category.findMany()
  if (!cats.length) {
    const defaults = [
      { name:'Celulares', slug:'celulares', icon:'📱' },
      { name:'Notebooks', slug:'notebooks', icon:'💻' },
      { name:'Gaming', slug:'gaming', icon:'🎮' },
      { name:'Componentes PC', slug:'componentes', icon:'🖥️' },
      { name:'Monitores', slug:'monitores', icon:'🖥' },
      { name:'Accesorios', slug:'accesorios', icon:'🖱️' },
    ]
    for (const d of defaults) await prisma.category.upsert({ where:{slug:d.slug}, update:{}, create:d })
    cats = await prisma.category.findMany()
  }

  const catMap: Record<string,string> = {}
  for (const c of cats) { catMap[c.slug] = c.id; catMap[c.name.toLowerCase()] = c.id }
  const fallbackCatId = cats[0].id

  function getCatId(nombre: string) {
    const slug = SLUG_MAP[nombre] || slugify(nombre)
    return catMap[slug] || catMap[nombre?.toLowerCase()] || fallbackCatId
  }

  if (reemplazar) await prisma.product.deleteMany({})

  const stats = { insertados: 0, errores: 0, omitidos: 0 }
  const erroresDetalle: string[] = []

  for (let i = 0; i < productos.length; i += 50) {
    const lote = productos.slice(i, i + 50)
    await Promise.allSettled(lote.map(async (p: any) => {
      try {
        const nombre = p.nombre?.trim()
        if (!nombre) { stats.omitidos++; return }
        const precioUSD = parseFloat(p.precio_usd) || 0
        if (precioUSD <= 0) { stats.omitidos++; return }

        const categoryId = getCatId(p.categoria || 'Accesorios')
        const brand = extraerBrand(nombre)
        const sku = p.sku ? String(p.sku) : null
        const baseSlug = p.slug || slugify(nombre)
        const slug = sku ? `${baseSlug}-${sku}` : baseSlug

        const data = {
          name: nombre, slug, brand,
          sku: sku || undefined,
          price: precioUSD,
          stock: parseInt(p.stock) || 999,
          images: p.imagen ? [p.imagen] : [],
          status: 'ACTIVE' as const,
          featured: false,
          categoryId,
          description: null,
          specs: { codigo_proveedor: sku || '', url_proveedor: p.url_proveedor || '' } as any,
        }

        await prisma.product.upsert({
          where: { slug },
          update: { ...data, slug: undefined },
          create: data,
        })
        stats.insertados++
      } catch (err: any) {
        stats.errores++
        if (erroresDetalle.length < 3) erroresDetalle.push(`${p.sku}: ${err.message}`)
      }
    }))
  }

  return NextResponse.json({ ok: true, stats, errores_muestra: erroresDetalle, timestamp: new Date().toISOString() })
}

export async function GET(req: NextRequest) {
  if (!verificarAdmin(req)) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const total = await prisma.product.count()
  return NextResponse.json({ ok: true, total_productos: total })
}
