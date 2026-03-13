import { Menu } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  const { toggleSidebar } = useUIStore()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center gap-4">
      <button
        onClick={toggleSidebar}
        className="lg:hidden text-gray-500 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Toggle sidebar"
      >
        <Menu size={20} />
      </button>
      {title && <h1 className="text-xl font-semibold text-gray-900">{title}</h1>}
    </header>
  )
}
