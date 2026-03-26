import { prisma } from './prisma'

export async function getFeaturedProducts(limit = 8) {
  return prisma.product.findMany({
    where: { featured: true, status: 'ACTIVE' },
    include: { category: { select: { name: true, slug: true } } },
    take: limit,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      reviews: {
        include: { user: { select: { name: true, image: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
    },
  })
}

export async function getRelatedProducts(categoryId: string, excludeId: string, limit = 6) {
  return prisma.product.findMany({
    where:   { categoryId, id: { not: excludeId }, status: 'ACTIVE' },
    include: { category: { select: { name: true, slug: true } } },
    take:    limit,
    orderBy: { createdAt: 'desc' },
  })
}

export async function getPCBuilderComponents(slot: string) {
  return prisma.product.findMany({
    where: { pcBuilderSlot: slot as any, status: 'ACTIVE', stock: { gt: 0 } },
    select: {
      id: true, name: true, brand: true, price: true,
      images: true, specs: true, wattage: true, socket: true,
    },
    orderBy: { price: 'asc' },
  })
}

export async function getCategories() {
  return prisma.category.findMany({ orderBy: { name: 'asc' } })
}
