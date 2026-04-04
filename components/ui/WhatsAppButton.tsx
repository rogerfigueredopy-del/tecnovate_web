'use client'
import { MessageCircle } from 'lucide-react'

const WA_NUMBER = '595971117959'
const WA_MSG    = encodeURIComponent('Hola! Quiero consultar sobre un producto de Tecnovate.')

export function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WA_NUMBER}?text=${WA_MSG}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
      style={{ width: 56, height: 56, background: '#25d366' }}
    >
      <MessageCircle size={28} color="white" fill="white" />
    </a>
  )
}
