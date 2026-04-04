'use client'

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
      style={{ width: 58, height: 58, background: '#25d366' }}
    >
      <svg viewBox="0 0 48 48" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4C12.954 4 4 12.954 4 24c0 3.59.944 6.958 2.596 9.868L4 44l10.368-2.562A19.9 19.9 0 0 0 24 44c11.046 0 20-8.954 20-20S35.046 4 24 4Z" fill="white"/>
        <path d="M34.507 29.19c-.463-.232-2.738-1.35-3.162-1.504-.424-.155-.733-.232-1.042.232-.309.463-1.197 1.504-1.467 1.813-.27.309-.54.347-1.003.116-.463-.232-1.955-.72-3.724-2.297-1.376-1.228-2.305-2.745-2.576-3.208-.27-.463-.028-.713.203-.944.208-.208.463-.54.694-.81.232-.27.309-.463.463-.772.155-.309.077-.579-.039-.81-.116-.232-1.042-2.512-1.428-3.44-.376-.904-.759-.781-1.042-.796l-.887-.015c-.309 0-.81.116-1.234.579-.424.463-1.62 1.582-1.62 3.862 0 2.28 1.659 4.483 1.89 4.792.232.309 3.265 4.985 7.91 6.991 1.105.477 1.967.762 2.638.975 1.109.352 2.118.302 2.916.183.889-.133 2.738-1.12 3.124-2.201.386-1.082.386-2.01.27-2.204-.116-.193-.424-.309-.887-.54Z" fill="#25d366"/>
      </svg>
    </a>
  )
}
