import { Baby, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types/domain'

interface RoleSelectorProps {
  value: UserRole | null
  onChange: (role: UserRole) => void
}

export function RoleSelector({ value, onChange }: RoleSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('parent')}
        className={cn(
          'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center',
          value === 'parent'
            ? 'border-violet-500 bg-violet-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-violet-300 hover:bg-violet-50/50'
        )}
      >
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', value === 'parent' ? 'bg-violet-500' : 'bg-gray-100')}>
          <Users size={24} className={value === 'parent' ? 'text-white' : 'text-gray-500'} />
        </div>
        <div>
          <p className={cn('font-semibold text-sm', value === 'parent' ? 'text-violet-700' : 'text-gray-800')}>
            I'm a Parent
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Looking for childcare</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('babysitter')}
        className={cn(
          'flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all text-center',
          value === 'babysitter'
            ? 'border-pink-500 bg-pink-50 shadow-md'
            : 'border-gray-200 bg-white hover:border-pink-300 hover:bg-pink-50/50'
        )}
      >
        <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center', value === 'babysitter' ? 'bg-pink-500' : 'bg-gray-100')}>
          <Baby size={24} className={value === 'babysitter' ? 'text-white' : 'text-gray-500'} />
        </div>
        <div>
          <p className={cn('font-semibold text-sm', value === 'babysitter' ? 'text-pink-700' : 'text-gray-800')}>
            I'm a Babysitter
          </p>
          <p className="text-xs text-gray-500 mt-0.5">Offering childcare</p>
        </div>
      </button>
    </div>
  )
}
