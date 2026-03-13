import { useState, useCallback } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import { useAvailability } from '@/hooks/useAvailability'
import { useBookings, useOpenRequests } from '@/hooks/useBookings'
import { BookingActionModal } from './BookingActionModal'
import { ToastContainer, type ToastData } from '@/components/ui/Toast'
import { useT } from '@/hooks/useT'
import type { BookingWithProfiles } from '@/types/domain'

const bookingColors: Record<string, { bg: string; border: string; text: string }> = {
  pending:   { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  confirmed: { bg: '#7c3aed', border: '#6d28d9', text: '#ffffff' },
  completed: { bg: '#10b981', border: '#059669', text: '#ffffff' },
}

export function AvailabilityCalendar() {
  const { user } = useAuthStore()
  const { slots, addSlot, removeSlot } = useAvailability(user?.id)
  const { bookings, updateBookingStatus } = useBookings()
  const [selectedBooking, setSelectedBooking] = useState<BookingWithProfiles | null>(null)
  const [toasts, setToasts] = useState<ToastData[]>([])
  const { t } = useT()

  const handleNewRequest = useCallback((booking: BookingWithProfiles) => {
    const start = new Date(booking.start_time)
    setToasts((prev) => [
      ...prev,
      {
        id: booking.id,
        title: t.toast.title,
        message: t.toast.body(
          booking.parent?.full_name || 'A parent',
          format(start, 'EEE, MMM d'),
          format(start, 'h:mm a')
        ),
        type: 'info',
      },
    ])
  }, [t])

  const { openRequests, acceptRequest } = useOpenRequests(handleNewRequest)

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const availabilityEvents = slots.map((slot) => ({
    id: `avail-${slot.id}`,
    start: slot.start_time,
    end: slot.end_time,
    title: 'Available',
    backgroundColor: '#10b981',
    borderColor: '#059669',
    textColor: '#ffffff',
    extendedProps: { type: 'availability', slotId: slot.id },
  }))

  // Own confirmed bookings
  const myBookingEvents = bookings
    .filter((b) => b.status !== 'cancelled')
    .map((b) => {
      const cfg = bookingColors[b.status] ?? bookingColors.confirmed
      return {
        id: `mybooking-${b.id}`,
        start: b.start_time,
        end: b.end_time,
        title: `✅ ${b.parent?.full_name || 'Confirmed'}`,
        backgroundColor: cfg.bg,
        borderColor: cfg.border,
        textColor: cfg.text,
        extendedProps: { type: 'booking', booking: b },
      }
    })

  // Open requests from all parents (not yet assigned)
  const openRequestEvents = openRequests.map((r) => ({
    id: `open-${r.id}`,
    start: r.start_time,
    end: r.end_time,
    title: `📋 ${r.parent?.full_name || 'Parent'} needs a sitter`,
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    textColor: '#92400e',
    extendedProps: { type: 'openRequest', booking: r },
  }))

  const handleSelect = useCallback(async (info: DateSelectArg) => {
    if (!user) return
    try {
      await addSlot({
        babysitter_id: user.id,
        start_time: info.startStr,
        end_time: info.endStr,
        is_recurring: false,
        recurrence_rule: null,
      })
    } catch {
      alert('Failed to add availability slot')
    }
  }, [user, addSlot])

  const handleEventClick = useCallback((info: EventClickArg) => {
    const { type, slotId, booking } = info.event.extendedProps
    if (type === 'availability') {
      if (confirm('Remove this availability slot?')) {
        removeSlot(slotId)
      }
    } else if (type === 'booking' || type === 'openRequest') {
      setSelectedBooking(booking as BookingWithProfiles)
    }
  }, [removeSlot])

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">{t.calendar.babysitterHint}</p>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={[...availabilityEvents, ...myBookingEvents, ...openRequestEvents]}
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

      {selectedBooking && (
        <BookingActionModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onConfirm={async () => {
            if (selectedBooking.babysitter_id === null) {
              await acceptRequest(selectedBooking.id)
            } else {
              await updateBookingStatus(selectedBooking.id, 'confirmed')
            }
            setSelectedBooking(null)
          }}
          onDecline={async () => {
            await updateBookingStatus(selectedBooking.id, 'cancelled')
            setSelectedBooking(null)
          }}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}
