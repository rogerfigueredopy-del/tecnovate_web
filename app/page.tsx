import Link from 'next/link'
import { CategoryGrid, GamerBanner } from '@/components/ui/CategoryGrid'
import { ProductGrid } from '@/components/ui/ProductGrid'
import { getFeaturedProducts } from '@/lib/products'

export default async function HomePage() {
  const featured = await getFeaturedProducts(8)

  return (
    <div>
      <section className="relative bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 py-20 text-center px-4">
        <h1 className="text-5xl font-black text-white mb-4">
          Tecnología de{' '}
          <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
            Primera
          </span>
        </h1>
        <p className="text-gray-400 text-lg mb-8">Computadoras, gaming, celulares — Ciudad del Este, Paraguay</p>
        <div className="flex gap-4 justify-center">
          <Link href="/products" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-xl transition-colors">
            Ver Productos
          </Link>
          <Link href="/gamer" className="border border-purple-500/50 hover:border-purple-400 text-white px-8 py-3 rounded-xl transition-colors">
            ⚡ Armar mi PC
          </Link>
        </div>
      </section>

      <CategoryGrid />
      <GamerBanner />

      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold">Ofertas Destacadas</h2>
          <Link href="/products" className="text-cyan-400 hover:text-cyan-300 text-sm">
            Ver todos →
          </Link>
        </div>
        <ProductGrid products={featured} />
      </section>
    </div>
  )
}
