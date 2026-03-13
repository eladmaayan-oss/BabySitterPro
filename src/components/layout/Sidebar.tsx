import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Search, CalendarDays, MessageCircle, User, Baby, LogOut, Languages, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { useT } from '@/hooks/useT'
import { Avatar } from '@/components/ui/Avatar'

export function Sidebar() {
  const { profile, signOut } = useAuth()
  const { t, toggle } = useT()

  const parentLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/browse', icon: Search, label: t.nav.findBabysitter },
    { to: '/calendar', icon: CalendarDays, label: t.nav.calendar },
    { to: '/messages', icon: MessageCircle, label: t.nav.messages },
    { to: '/profile', icon: User, label: t.nav.myProfile },
  ]

  const babysitterLinks = [
    { to: '/dashboard', icon: LayoutDashboard, label: t.nav.dashboard },
    { to: '/calendar', icon: CalendarDays, label: t.nav.calendar },
    { to: '/messages', icon: MessageCircle, label: t.nav.messages },
    { to: '/profile', icon: User, label: t.nav.myProfile },
  ]

  const links = profile?.role === 'babysitter' ? babysitterLinks : parentLinks

  return (
    <aside className="flex flex-col w-64 bg-white border-r border-gray-100 min-h-screen">
      <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100">
        <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
          <Baby size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-gray-900">BabySitter Pro</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-4 border-t border-gray-100 pt-4 space-y-1">
        {/* Admin link */}
        {profile?.is_admin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <ShieldCheck size={20} />
            {t.admin.title}
          </NavLink>
        )}

        {/* Language toggle */}
        <button
          onClick={toggle}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-violet-50 hover:text-violet-700 transition-colors w-full"
        >
          <Languages size={20} />
          {t.nav.toggleLang}
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 px-3 py-2.5">
          <Avatar src={profile?.avatar_url} name={profile?.full_name} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'User'}</p>
            <p className="text-xs text-gray-500">
              {profile?.role === 'parent' ? t.nav.role.parent : profile?.role === 'babysitter' ? t.nav.role.babysitter : ''}
            </p>
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors w-full"
        >
          <LogOut size={20} />
          {t.nav.signOut}
        </button>
      </div>
    </aside>
  )
}
