import { Outlet } from 'react-router-dom'
import { Baby } from 'lucide-react'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-pink-50 flex flex-col">
      <header className="px-6 py-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
          <Baby size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">BabySitter Pro</span>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  )
}
