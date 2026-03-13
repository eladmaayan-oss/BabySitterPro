import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import { BookingModal } from './BookingModal'
import { useBookings } from '@/hooks/useBookings'
import { useT } from '@/hooks/useT'
import type { BookingWithProfiles } from '@/types/domain'

const statusConfig: Record<string, { bg: string; border: string; textColor: string }> = {
  pending:   { bg: '#fef3c7', border: '#f59e0b', textColor: '#92400e' },
  confirmed: { bg: '#7c3aed', border: '#6d28d9', textColor: '#ffffff' },
  cancelled: { bg: '#f3f4f6', border: '#9ca3af', textColor: '#6b7280' },
  completed: { bg: '#10b981', border: '#059669', textColor: '#ffffff' },
}

export function BookingCalendar() {
  const { bookings, createBooking, updateBookingStatus } = useBookings()
  const { t } = useT()
  const [selectInfo, setSelectInfo] = useState<{ start: Date; end: Date } | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfiles | null>(null)

  const handleBook = useCallback(async (notes: string) => {
    if (!selectInfo) return
    await createBooking({
      start_time: selectInfo.start.toISOString(),
      end_time: selectInfo.end.toISOString(),
      notes: notes || undefined,
    })
  }, [selectInfo, createBooking])

  const events = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((b) => {
      const cfg = statusConfig[b.status] ?? statusConfig.pending
      const icon = b.status === 'pending' ? '⏳' : b.status === 'confirmed' ? '✅' : '🏁'
      const label = b.status === 'pending' && !b.babysitter_id
        ? t.openRequest
        : b.babysitter?.full_name || 'Babysitter'
      return {
        id: b.id,
        title: `${icon} ${label}`,
        start: b.start_time,
        end: b.end_time,
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        textColor: cfg.textColor,
        extendedProps: { booking: b },
      }
    })

  const handleSelect = useCallback((info: DateSelectArg) => {
    setSelectInfo({ start: info.start, end: info.end })
  }, [])

  const handleEventClick = useCallback((info: EventClickArg) => {
    const booking = info.event.extendedProps.booking as BookingWithProfiles
    setSelectedBooking(booking)
  }, [])

  return (
    <>
      <p className="text-sm text-gray-500 mb-4">{t.calendar.parentHint}</p>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        selectable
        selectMirror
        select={handleSelect}
        eventClick={handleEventClick}
        height="auto"
        eventTimeFormat={{ hour: 'numeric', minute: '2-digit', meridiem: 'short' }}
        slotMinTime="06:00:00"
        slotMaxTime="23:00:00"
        allDaySlot={false}
      />

      {selectInfo && (
        <BookingModal
          open
          onClose={() => setSelectInfo(null)}
          startTime={selectInfo.start}
          endTime={selectInfo.end}
          onBook={handleBook}
        />
      )}

      {selectedBooking && (
        <ParentBookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={async () => {
            await updateBookingStatus(selectedBooking.id, 'cancelled')
            setSelectedBooking(null)
          }}
        />
      )}
    </>
  )
}

// Simple inline detail modal for parents to view/cancel their bookings
import { format } from 'date-fns'
import { Clock } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils'

function ParentBookingDetailModal({
  booking,
  onClose,
  onCancel,
}: {
  booking: BookingWithProfiles
  onClose: () => void
  onCancel: () => void
}) {
  const start = new Date(booking.start_time)
  const end = new Date(booking.end_time)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const canCancel = booking.status === 'pending' || booking.status === 'confirmed'
  const { t } = useT()
  const m = t.parentBookingModal

  return (
    <Modal open onClose={onClose} title={m.title}>
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          {booking.babysitter
            ? <Avatar src={booking.babysitter.avatar_url} name={booking.babysitter.full_name} size="md" />
            : <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 text-lg">⏳</div>
          }
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{m.babysitter}</p>
            <p className="font-semibold text-gray-900">
              {booking.babysitter?.full_name || (booking.status === 'pending' ? m.waitingForBabysitter : 'Unknown')}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
          <Clock size={18} className="text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-violet-900">{format(start, 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-sm text-violet-700">
              {format(start, 'h:mm a')} — {format(end, 'h:mm a')} ({hours.toFixed(1)} {t.bookingModal.hrs})
            </p>
          </div>
        </div>

        {booking.total_price != null && booking.total_price > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-xl text-sm">
            <span className="text-green-700 font-medium">{m.estimatedTotal}</span>
            <span className="font-bold text-green-800">{formatCurrency(booking.total_price)}</span>
          </div>
        )}

        {booking.notes && (
          <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-700">
            <p className="font-medium mb-1">{m.yourNote}:</p>
            <p>{booking.notes}</p>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm px-1">
          <span className="text-gray-500">{m.status}:</span>
          <span className={`font-semibold capitalize ${
            booking.status === 'pending' ? 'text-amber-600' :
            booking.status === 'confirmed' ? 'text-violet-600' :
            'text-emerald-600'
          }`}>{booking.status}</span>
        </div>

        <div className="flex gap-3 pt-1">
          {canCancel && (
            <Button variant="danger" onClick={onCancel} className="flex-1">{m.cancelBooking}</Button>
          )}
          <Button variant="secondary" onClick={onClose} className="flex-1">{m.close}</Button>
        </div>
      </div>
    </Modal>
  )
}
