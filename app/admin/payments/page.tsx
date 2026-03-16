'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Save, CreditCard, Globe, Banknote, Phone } from 'lucide-react'

interface GatewayConfig {
  enabled: boolean
  [key: string]: any
}

export default function AdminPaymentsPage() {
  const [bancard, setBancard] = useState<GatewayConfig>({
    enabled: true, publicKey: '', privateKey: '', sandbox: true,
  })
  const [paypal, setPaypal] = useState<GatewayConfig>({
    enabled: true, clientId: '', secret: '', sandbox: true,
  })
  const [transfer, setTransfer] = useState<GatewayConfig>({
    enabled: true, bank: '', account: '', tigoMoney: '', personalPay: '',
  })
  const [cash, setCash] = useState<GatewayConfig>({
    enabled: true, address: '', whatsapp: '', hours: 'Lun–Sáb 8:00–18:00',
  })

  const save = (name: string) => {
    toast.success(`✓ ${name} guardado correctamente`)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black">Configuración de Pagos</h1>
        <p className="text-sm text-gray-500 mt-1">Configurá los métodos de pago disponibles en la tienda</p>
      </div>

      <div className="space-y-6 max-w-2xl">

        {/* Bancard */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500/15 rounded-xl flex items-center justify-center">
                <CreditCard size={18} className="text-blue-400" />
              </div>
              <div>
                <h2 className="font-bold">Bancard</h2>
                <p className="text-xs text-gray-500">Visa, Mastercard, Amex — Paraguay</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={bancard.enabled} onChange={e => setBancard(b => ({...b, enabled: e.target.checked}))} className="w-4 h-4 accent-cyan-500" />
              <span className="text-sm text-gray-400">{bancard.enabled ? 'Activo' : 'Inactivo'}</span>
            </label>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400">
                <input type="checkbox" checked={bancard.sandbox} onChange={e => setBancard(b => ({...b, sandbox: e.target.checked}))} className="accent-amber-400" />
                Modo sandbox (pruebas)
              </label>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Public Key</label>
              <input
                type="password"
                value={bancard.publicKey}
                onChange={e => setBancard(b => ({...b, publicKey: e.target.value}))}
                placeholder="GZl1CjyzqGFF4f0a..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Private Key</label>
              <input
                type="password"
                value={bancard.privateKey}
                onChange={e => setBancard(b => ({...b, privateKey: e.target.value}))}
                placeholder="Hjuy6trFG..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100"
              />
            </div>
            <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400">
              <span className="text-gray-300 font-semibold">Webhook URL:</span>{' '}
              <code className="text-cyan-400">https://TU_DOMINIO/api/payments/bancard-confirm</code>
              <br />Registrá esta URL en el portal de Bancard para confirmar pagos automáticamente.
            </div>
          </div>

          <button onClick={() => save('Bancard')} className="mt-4 flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            <Save size={14} /> Guardar Bancard
          </button>
        </div>

        {/* PayPal */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500/15 rounded-xl flex items-center justify-center">
                <Globe size={18} className="text-cyan-400" />
              </div>
              <div>
                <h2 className="font-bold">PayPal</h2>
                <p className="text-xs text-gray-500">Pagos internacionales con tarjeta o cuenta PayPal</p>
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={paypal.enabled} onChange={e => setPaypal(p => ({...p, enabled: e.target.checked}))} className="w-4 h-4 accent-cyan-500" />
              <span className="text-sm text-gray-400">{paypal.enabled ? 'Activo' : 'Inactivo'}</span>
            </label>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-gray-400 mb-1">
              <input type="checkbox" checked={paypal.sandbox} onChange={e => setPaypal(p => ({...p, sandbox: e.target.checked}))} className="accent-amber-400" />
              Modo sandbox
            </label>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Client ID</label>
              <input type="password" value={paypal.clientId} onChange={e => setPaypal(p => ({...p, clientId: e.target.value}))} placeholder="AZDxjD..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Secret</label>
              <input type="password" value={paypal.secret} onChange={e => setPaypal(p => ({...p, secret: e.target.value}))} placeholder="EGnHDx..." className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
          </div>

          <button onClick={() => save('PayPal')} className="mt-4 flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            <Save size={14} /> Guardar PayPal
          </button>
        </div>

        {/* Transfer */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-500/15 rounded-xl flex items-center justify-center">
              <Banknote size={18} className="text-green-400" />
            </div>
            <div>
              <h2 className="font-bold">Transferencia / Tigo Money</h2>
              <p className="text-xs text-gray-500">El cliente envía comprobante por WhatsApp</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Banco</label>
              <input value={transfer.bank} onChange={e => setTransfer(t => ({...t, bank: e.target.value}))} placeholder="Banco Continental" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Nro de cuenta</label>
              <input value={transfer.account} onChange={e => setTransfer(t => ({...t, account: e.target.value}))} placeholder="0000-0000-00" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Tigo Money</label>
              <input value={transfer.tigoMoney} onChange={e => setTransfer(t => ({...t, tigoMoney: e.target.value}))} placeholder="+595 9XX XXX XXX" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Personal Pay</label>
              <input value={transfer.personalPay} onChange={e => setTransfer(t => ({...t, personalPay: e.target.value}))} placeholder="+595 9XX XXX XXX" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
          </div>
          <button onClick={() => save('Transferencia')} className="mt-4 flex items-center gap-2 bg-green-700 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            <Save size={14} /> Guardar Transferencia
          </button>
        </div>

        {/* Cash */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-500/15 rounded-xl flex items-center justify-center">
              <Phone size={18} className="text-amber-400" />
            </div>
            <div>
              <h2 className="font-bold">Efectivo / Retiro en local</h2>
              <p className="text-xs text-gray-500">Coordinación por WhatsApp</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Dirección del local</label>
              <input value={cash.address} onChange={e => setCash(c => ({...c, address: e.target.value}))} placeholder="Avda. San Blas esq..., Ciudad del Este" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">WhatsApp</label>
                <input value={cash.whatsapp} onChange={e => setCash(c => ({...c, whatsapp: e.target.value}))} placeholder="+595 9XX XXX XXX" className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Horario</label>
                <input value={cash.hours} onChange={e => setCash(c => ({...c, hours: e.target.value}))} className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-cyan-500 text-gray-100" />
              </div>
            </div>
          </div>
          <button onClick={() => save('Efectivo')} className="mt-4 flex items-center gap-2 bg-amber-700 hover:bg-amber-600 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors">
            <Save size={14} /> Guardar Efectivo
          </button>
        </div>

      </div>
    </div>
  )
}
