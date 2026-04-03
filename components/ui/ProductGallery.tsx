'use client'
import { useState, useCallback } from 'react'
import { X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props { images: string[]; name: string }

export function ProductGallery({ images, name }: Props) {
  const [selected, setSelected]   = useState(0)
  const [lightbox, setLightbox]   = useState(false)
  const [lbIndex,  setLbIndex]    = useState(0)

  const openLightbox = (i: number) => { setLbIndex(i); setLightbox(true) }
  const closeLightbox = () => setLightbox(false)

  const lbPrev = useCallback(() => setLbIndex(i => (i - 1 + images.length) % images.length), [images.length])
  const lbNext = useCallback(() => setLbIndex(i => (i + 1) % images.length), [images.length])

  if (!images?.length) return (
    <div className="rounded-2xl flex items-center justify-center bg-white"
      style={{ aspectRatio: '1', border: '1.5px solid var(--border)' }}>
      <div className="text-8xl opacity-20">📦</div>
    </div>
  )

  return (
    <>
      {/* Imagen principal */}
      <div
        className="relative rounded-2xl overflow-hidden flex items-center justify-center bg-white group cursor-zoom-in"
        style={{ aspectRatio: '1', border: '1.5px solid var(--border)' }}
        onClick={() => openLightbox(selected)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[selected]}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          style={{ padding: '16px' }}
        />
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-1.5"
          style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}>
          <ZoomIn size={16} />
        </div>
        {/* Flechas en imagen principal si hay varias */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.stopPropagation(); setSelected(i => (i - 1 + images.length) % images.length) }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}>
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={e => { e.stopPropagation(); setSelected(i => (i + 1) % images.length) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.35)', color: 'white' }}>
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelected(i)}
              className="shrink-0 w-16 h-16 rounded-xl overflow-hidden flex items-center justify-center bg-white transition-all hover:scale-105"
              style={{
                border: i === selected ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                padding: '4px',
                boxShadow: i === selected ? '0 0 0 2px var(--accent-light)' : 'none',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt="" className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={closeLightbox}
        >
          {/* Cerrar */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
            <X size={20} />
          </button>

          {/* Imagen */}
          <div className="relative max-w-4xl max-h-[85vh] flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lbIndex]}
              alt={name}
              className="max-w-full max-h-[80vh] object-contain rounded-xl"
              style={{ userSelect: 'none' }}
            />
          </div>

          {/* Flechas lightbox */}
          {images.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); lbPrev() }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <ChevronLeft size={22} />
              </button>
              <button
                onClick={e => { e.stopPropagation(); lbNext() }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white' }}>
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Contador y thumbnails en lightbox */}
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {images.map((img, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); setLbIndex(i) }}
                  className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center transition-all hover:scale-110"
                  style={{ border: i === lbIndex ? '2px solid var(--accent)' : '1.5px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.08)', padding: '3px' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <p className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {lbIndex + 1} / {images.length}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
