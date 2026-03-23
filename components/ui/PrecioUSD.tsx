// components/ui/PrecioUSD.tsx
// Mostrá el precio en PYG con el cambio del día
// El campo `price` en tu DB está en USD
//
// Uso:
//   <PrecioUSD usd={product.price} />
//   <PrecioUSD usd={product.price} margen={0.35} mostrarUSD />

'use client'

import { useEffect, useState } from 'react'

let _cambio: number | null = null
let _ts: number | null = null
const TTL = 30 * 60 * 1000 // 30 min cache

async function getCambio(): Promise<number> {
  if (_cambio && _ts && Date.now() - _ts < TTL) return _cambio
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD')
    const d = await r.json()
    _cambio = d.rates?.PYG || 7800
    _ts = Date.now()
    return _cambio!
  } catch {
    return 7800
  }
}

function fmtPYG(n: number) {
  return 'Gs. ' + new Intl.NumberFormat('es-PY').format(Math.round(n))
}
function fmtUSD(n: number) {
  return 'U$ ' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

interface Props {
  usd: number
  margen?: number       // default 0.30 = 30%
  mostrarUSD?: boolean  // mostrar precio en USD debajo
  className?: string
}

export default function PrecioUSD({ usd, margen = 0.30, mostrarUSD = true, className = '' }: Props) {
  const [cambio, setCambio] = useState<number | null>(null)

  useEffect(() => {
    getCambio().then(setCambio)
  }, [])

  if (!cambio) {
    return (
      <div className={className}>
        <div className="h-6 w-28 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  const pyg = usd * cambio * (1 + margen)

  return (
    <div className={className}>
      <p className="text-xl font-bold text-gray-900">{fmtPYG(pyg)}</p>
      {mostrarUSD && (
        <p className="text-sm text-gray-500">{fmtUSD(usd)} USD</p>
      )}
    </div>
  )
}
