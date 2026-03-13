import { useEffect, useState } from 'react'
import { X, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ToastData {
  id: string
  title: string
  message: string
  type?: 'info' | 'success' | 'warning'
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    const t1 = setTimeout(() => setVisible(true), 10)
    // Auto-dismiss after 6s
    const t2 = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismiss(toast.id), 300)
    }, 6000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [toast.id, onDismiss])

  return (
    <div className={cn(
      'flex items-start gap-3 bg-white border border-gray-200 shadow-lg rounded-2xl px-4 py-3 w-80 transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
    )}>
      <div className="mt-0.5 p-1.5 bg-amber-100 rounded-lg shrink-0">
        <Bell size={14} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900">{toast.title}</p>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{toast.message}</p>
      </div>
      <button
        onClick={() => { setVisible(false); setTimeout(() => onDismiss(toast.id), 300) }}
        className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
