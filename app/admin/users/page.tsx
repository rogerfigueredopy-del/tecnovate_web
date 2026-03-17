export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import { AdminUserRole } from '@/components/admin/AdminUserRole'

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { orders: true } },
    },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black">Usuarios</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} cuentas registradas</p>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Usuario</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Email</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Teléfono</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Pedidos</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Registro</th>
                <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">Rol</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan-800 flex items-center justify-center text-sm font-bold shrink-0">
                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-sm">{user.name || <span className="text-gray-500 italic">Sin nombre</span>}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-gray-400">{user.email}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{user.phone || '—'}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-sm font-semibold text-cyan-400">{user._count.orders}</span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString('es-PY')}
                  </td>
                  <td className="px-5 py-3.5">
                    <AdminUserRole userId={user.id} currentRole={user.role} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
