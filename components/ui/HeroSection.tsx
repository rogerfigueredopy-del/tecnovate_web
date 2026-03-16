'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ShoppingBag, ChevronRight } from 'lucide-react'

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-purple-500/8 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap size={14} />
              Envíos a todo Paraguay
            </span>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6 text-white">
              Tecnología de{' '}
              <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
                Primera
              </span>
              <br />
              en Paraguay
            </h1>

            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Computadoras, gaming, celulares y accesorios — precios competitivos,<br />
              stock real, despacho rápido desde Ciudad del Este.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/products"
                className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3.5 rounded-xl transition-all hover:scale-105"
              >
                <ShoppingBag size={18} />
                Ver Productos
              </Link>
              <Link
                href="/gamer"
                className="flex items-center gap-2 bg-transparent text-white border border-purple-500/50 hover:border-purple-400 px-8 py-3.5 rounded-xl transition-all hover:bg-purple-500/10"
              >
                <Zap size={18} className="text-purple-400" />
                Armar mi PC
                <ChevronRight size={16} />
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-6 mt-16 border-t border-gray-800 pt-10"
          >
            {[
              { val: '+500', label: 'Productos disponibles' },
              { val: '+1800', label: 'Clientes satisfechos' },
              { val: '24h', label: 'Envío Express CDE' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-black text-white">{s.val}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
