import { addDays, isAfter } from 'date-fns'
import { CalendarDays, Clock, DollarSign, MessageCircle, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TopBar } from '@/components/layout/TopBar'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/store/authStore'
import { useBookings } from '@/hooks/useBookings'
import { useT } from '@/hooks/useT'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import type { BookingStatus } from '@/types/domain'

const statusVariant: Record<BookingStatus, 'warning' | 'info' | 'default' | 'success'> = {
  pending: 'warning',
  confirmed: 'info',
  cancelled: 'default',
  completed: 'success',
}

export function Dashboard() {
  const { profile } = useAuthStore()
  const { bookings } = useBookings()
  const { t } = useT()
  const d = t.dashboard

  const now = new Date()
  const upcoming = bookings.filter(
    (b) => b.status !== 'cancelled' && isAfter(new Date(b.end_time), now)
  ).slice(0, 5)

  const thisWeekEarnings = bookings
    .filter((b) => b.status === 'completed' && isAfter(new Date(b.end_time), addDays(now, -7)))
    .reduce((sum, b) => sum + (b.total_price ?? 0), 0)

  const pendingRequests = bookings.filter((b) => b.status === 'pending')

  return (
    <div className="flex-1">
      <TopBar title={d.greeting(profile?.full_name?.split(' ')[0] ?? '')} />
      <div className="p-6 max-w-5xl mx-auto space-y-6">

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <CalendarDays size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{upcoming.length}</p>
                <p className="text-xs text-gray-500">{d.upcoming}</p>
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingRequests.length}</p>
                <p className="text-xs text-gray-500">{d.pending}</p>
              </div>
            </div>
          </Card>

          {profile?.role === 'babysitter' && (
            <Card padding="md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <DollarSign size={20} className="text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(thisWeekEarnings)}</p>
                  <p className="text-xs text-gray-500">{d.thisWeek}</p>
                </div>
              </div>
            </Card>
          )}

          <Card padding="md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageCircle size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-xs text-gray-500">{d.unreadMessages}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-3">
          {profile?.role === 'parent' && (
            <Link to="/browse">
              <Button variant="secondary">
                <Search size={16} />
                {d.findBabysitter}
              </Button>
            </Link>
          )}
          <Link to="/calendar">
            <Button variant="secondary">
              <CalendarDays size={16} />
              {d.viewCalendar}
            </Button>
          </Link>
          <Link to="/messages">
            <Button variant="secondary">
              <MessageCircle size={16} />
              {d.messages}
            </Button>
          </Link>
        </div>

        {/* Upcoming bookings */}
        <Card padding="none">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{d.upcomingBookings}</h2>
            <Link to="/calendar" className="text-sm text-violet-600 hover:underline">{d.viewAll}</Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-gray-500">
              {d.noUpcoming}{' '}
              {profile?.role === 'parent' && (
                <Link to="/browse" className="text-violet-600 hover:underline">{d.findBabysitter}</Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {upcoming.map((b) => (
                <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <CalendarDays size={18} className="text-violet-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.start_time)}</p>
                    <p className="text-xs text-gray-500">{formatTime(b.start_time)} — {formatTime(b.end_time)}</p>
                  </div>
                  <Badge variant={statusVariant[b.status]} className="capitalize">{b.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Pending requests (babysitter view) */}
        {profile?.role === 'babysitter' && pendingRequests.length > 0 && (
          <Card padding="none">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{d.pendingRequests}</h2>
            </div>
            <ul className="divide-y divide-gray-100">
              {pendingRequests.map((b) => (
                <li key={b.id} className="flex items-center gap-4 px-6 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{formatDate(b.start_time)}</p>
                    <p className="text-xs text-gray-500">{formatTime(b.start_time)} — {formatTime(b.end_time)}</p>
                    {b.notes && <p className="text-xs text-gray-500 mt-0.5 italic">"{b.notes}"</p>}
                  </div>
                  {b.total_price && (
                    <span className="text-sm font-semibold text-green-700">{formatCurrency(b.total_price)}</span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  )
}
