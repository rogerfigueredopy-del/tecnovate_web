// app/api/admin/import-products/route.ts
// ============================================================
//  TECNOVATE – Importación masiva de productos desde Excel
//  POST /api/admin/import-products
//  Requiere header: Authorization: Bearer $ADMIN_SECRET
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function verificarAdmin(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  return auth === `Bearer ${process.env.ADMIN_SECRET}`
}

function slugify(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 100)
}

// Extraer marca del nombre del producto
function extraerBrand(nombre: string): string {
  const marcas = [
    'Apple', 'Samsung', 'Xiaomi', 'Motorola', 'LG', 'Sony', 'Asus', 'Lenovo',
    'HP', 'Dell', 'Acer', 'MSI', 'Gigabyte', 'Intel', 'AMD', 'NVIDIA', 'WD',
    'Seagate', 'Kingston', 'Corsair', 'Logitech', 'Razer', 'HyperX', 'JBL',
    'Philips', 'Panasonic', 'Huawei', 'Realme', 'OnePlus', 'Nokia', 'Garmin',
    'Amazfit', 'TCL', 'Hisense', 'AOC', 'LG', 'ViewSonic', 'BenQ', 'ROG',
  ]
  const nombreUp = nombre.toLowerCase()
  for (const marca of marcas) {
    if (nombreUp.includes(marca.toLowerCase())) return marca
  }
  // Tomar la primera palabra como marca
  return nombre.split(' ')[0] || 'Sin marca'
}

// Mapa de categoría texto → slug en tu DB
const CATEGORIA_MAP: Record<string, string> = {
  'Celulares':     'celulares',
  'Notebooks':     'notebooks',
  'Gaming':        'gaming',
  'Componentes':   'componentes',
  'Monitores':     'monitores',
  'Accesorios':    'accesorios',
  'Electrónicos':  'accesorios',
  'Networking':    'accesorios',
  'Impresoras':    'accesorios',
}

// Cache de categorías para no hacer N queries
const categoriaCache: Record<string, string> = {}

async function obtenerCategoriaId(nombre: string): Promise<string> {
  if (categoriaCache[nombre]) return categoriaCache[nombre]

  const slug = CATEGORIA_MAP[nombre] || slugify(nombre)

  let categoria = await prisma.category.findUnique({ where: { slug } })

  if (!categoria) {
    categoria = await prisma.category.create({
      data: {
        name: nombre,
        slug,
        icon: '📦',
      },
    })
  }

  categoriaCache[nombre] = categoria.id
  return categoria.id
}

// ──────────────────────────────────────────────────────────────
//  POST /api/admin/import-products
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  if (!verificarAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const {
    productos = [],
    reemplazar = false,
    margen = 0.30,
  } = body

  if (!Array.isArray(productos) || productos.length === 0) {
    return NextResponse.json({ error: 'No se enviaron productos' }, { status: 400 })
  }

  const stats = { insertados: 0, actualizados: 0, errores: 0, omitidos: 0 }
  const erroresDetalle: string[] = []

  // Borrar todo si se pidió reemplazar
  if (reemplazar) {
    await prisma.product.deleteMany({})
  }

  // Procesar en lotes de 50 para no saturar Supabase
  const CHUNK = 50
  for (let i = 0; i < productos.length; i += CHUNK) {
    const lote = productos.slice(i, i + CHUNK)

    await Promise.allSettled(
      lote.map(async (p: any) => {
        try {
          const nombre = p.nombre?.trim()
          if (!nombre) { stats.omitidos++; return }

          // precio_usd → lo guardamos en `price` (en USD)
          const precioUSD = parseFloat(p.precio_usd) || 0
          if (precioUSD <= 0) { stats.omitidos++; return }

          const categoriaId = await obtenerCategoriaId(p.categoria || 'Accesorios')
          const brand = extraerBrand(nombre)

          // Slug único: usar el del JSON o generarlo
          let slug = p.slug || slugify(nombre)

          // Verificar duplicados de slug (agregar SKU si colisiona)
          const existente = await prisma.product.findUnique({ where: { slug } })
          if (existente && existente.sku !== p.sku) {
            slug = `${slug}-${p.sku || Date.now()}`
          }

          const data = {
            name: nombre,
            slug,
            brand,
            sku: p.sku || null,
            // Guardamos el precio en USD — el frontend convierte con la API de cambio
            price: precioUSD,
            oldPrice: null,
            stock: parseInt(p.stock) || 999,
            images: p.imagen ? [p.imagen] : [],
            status: 'ACTIVE' as const,
            featured: false,
            categoryId,
            description: p.descripcion || null,
            specs: p.sku ? { codigo_proveedor: p.sku, url_proveedor: p.url_proveedor || '' } : undefined,
          }

          await prisma.product.upsert({
            where: { sku: p.sku || `no-sku-${slug}` },
            update: data,
            create: data,
          })

          stats.insertados++
        } catch (err: any) {
          stats.errores++
          if (erroresDetalle.length < 5) {
            erroresDetalle.push(`${p.sku || p.nombre}: ${err.message}`)
          }
        }
      })
    )
  }

  return NextResponse.json({
    ok: true,
    stats,
    total_enviados: productos.length,
    errores_muestra: erroresDetalle,
    timestamp: new Date().toISOString(),
  })
}

// GET — verificar que el endpoint existe
export async function GET(req: NextRequest) {
  if (!verificarAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const total = await prisma.product.count()
  return NextResponse.json({ ok: true, total_productos: total })
}
