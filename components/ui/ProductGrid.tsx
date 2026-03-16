import { ProductCard } from './ProductCard'

export function ProductGrid({ products }: { products: any[] }) {
  if (!products.length) {
    return (
      <div className="text-center py-20 text-gray-500">
        <div className="text-5xl mb-4">🔍</div>
        <p className="text-lg">No se encontraron productos</p>
        <p className="text-sm mt-2">Intentá con otro término de búsqueda</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  )
}
