import { TopBar } from '@/components/layout/TopBar'
import { BookingCalendar } from '@/components/calendar/BookingCalendar'
import { AvailabilityCalendar } from '@/components/calendar/AvailabilityCalendar'
import { useAuthStore } from '@/store/authStore'
import { useT } from '@/hooks/useT'

export function CalendarPage() {
  const { profile } = useAuthStore()
  const { t } = useT()
  const L = t.calendar.legend

  return (
    <div className="flex-1">
      <TopBar title={t.calendar.title} />
      <div className="p-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          {profile?.role === 'babysitter' ? (
            <AvailabilityCalendar />
          ) : (
            <BookingCalendar />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4">
          {profile?.role === 'parent' ? (
            <>
              <LegendItem color="bg-amber-400" label={L.pending} />
              <LegendItem color="bg-violet-600" label={L.confirmed} />
              <LegendItem color="bg-emerald-500" label={L.completed} />
              <LegendItem color="bg-gray-400" label={L.cancelled} />
            </>
          ) : (
            <>
              <LegendItem color="bg-emerald-500" label={L.available} />
              <LegendItem color="bg-amber-400" label={L.bookingRequest} />
              <LegendItem color="bg-violet-600" label={L.confirmed} />
              <LegendItem color="bg-emerald-500" label={L.completed} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}
