const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const precioCero = await prisma.product.count({ where: { price: { lte: 0 } } })
  const slugBarra  = await prisma.product.count({ where: { slug: { contains: '/' } } })

  console.log('Precio <= 0:', precioCero)
  console.log('Slug con /:', slugBarra)

  if (precioCero > 0) {
    const r = await prisma.product.updateMany({
      where: { price: { lte: 0 } },
      data:  { status: 'ARCHIVED' }
    })
    console.log('Archivados precio 0:', r.count)
  }

  if (slugBarra > 0) {
    const bad = await prisma.product.findMany({
      where:  { slug: { contains: '/' } },
      select: { id: true, slug: true }
    })
    for (const prod of bad) {
      const parts  = prod.slug.split('/')
      let newSlug  = (parts[parts.length - 2] || parts[parts.length - 1] || prod.id)
        .replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').substring(0, 80)
      try {
        await prisma.product.update({ where: { id: prod.id }, data: { slug: newSlug } })
      } catch {
        await prisma.product.update({ where: { id: prod.id }, data: { slug: newSlug + '-' + prod.id.substring(0, 6) } })
      }
    }
    console.log('Slugs corregidos:', bad.length)
  }

  // Buscar el producto que rompe la página — specs con datos raros
  const sinImagenes = await prisma.product.count({ where: { images: { equals: [] } } })
  console.log('Sin imagenes:', sinImagenes)

  console.log('Todo listo!')
  await prisma.$disconnect()
}

main().catch(async e => {
  console.error(e.message)
  await prisma.$disconnect()
})
