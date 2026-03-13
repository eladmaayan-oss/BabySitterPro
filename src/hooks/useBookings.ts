import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { BookingWithProfiles, BookingStatus } from '@/types/domain'

const BOOKING_SELECT = `
  *,
  parent:profiles!bookings_parent_id_fkey(id, full_name, avatar_url),
  babysitter:profiles!bookings_babysitter_id_fkey(id, full_name, avatar_url, hourly_rate)
`

// Hook for the logged-in user's own bookings
export function useBookings() {
  const { user, profile } = useAuthStore()
  const [bookings, setBookings] = useState<BookingWithProfiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchBookings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const column = profile?.role === 'parent' ? 'parent_id' : 'babysitter_id'
    const { data, error } = await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq(column, user.id)
      .order('start_time', { ascending: true })
    if (error) setError(error.message)
    else setBookings((data as unknown as BookingWithProfiles[]) ?? [])
    setLoading(false)
  }, [user, profile?.role])

  useEffect(() => { fetchBookings() }, [fetchBookings])

  const createBooking = useCallback(async (booking: {
    start_time: string
    end_time: string
    notes?: string
    total_price?: number
    babysitter_id?: string
  }) => {
    if (!user) return
    const { data, error } = await supabase
      .from('bookings')
      .insert({ ...booking, parent_id: user.id, status: 'pending' } as never)
      .select(BOOKING_SELECT)
      .single()
    if (error) throw error
    const b = data as unknown as BookingWithProfiles
    setBookings((prev) => [...prev, b])
    return b
  }, [user])

  const updateBookingStatus = useCallback(async (bookingId: string, status: BookingStatus) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status } as never)
      .eq('id', bookingId)
      .select(BOOKING_SELECT)
      .single()
    if (error) throw error
    const b = data as unknown as BookingWithProfiles
    setBookings((prev) => prev.map((bk) => (bk.id === bookingId ? b : bk)))
    return b
  }, [])

  const cancelBooking = useCallback(
    (bookingId: string) => updateBookingStatus(bookingId, 'cancelled'),
    [updateBookingStatus]
  )

  return { bookings, loading, error, createBooking, updateBookingStatus, cancelBooking, refetch: fetchBookings }
}

// Hook for babysitters: fetches all open requests + realtime notifications
export function useOpenRequests(onNewRequest?: (booking: BookingWithProfiles) => void) {
  const { user } = useAuthStore()
  const [openRequests, setOpenRequests] = useState<BookingWithProfiles[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    const fetch = async () => {
      const { data } = await supabase
        .from('bookings')
        .select(BOOKING_SELECT)
        .is('babysitter_id', null)
        .eq('status', 'pending')
        .order('start_time', { ascending: true })
      setOpenRequests((data as unknown as BookingWithProfiles[]) ?? [])
      setLoading(false)
    }
    fetch()

    // Realtime: notify when a new open request is posted
    const channel = supabase
      .channel('open-booking-requests')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'bookings',
      }, async (payload) => {
        if (payload.new.babysitter_id !== null) return
        // Fetch the full record with profiles
        const { data } = await supabase
          .from('bookings')
          .select(BOOKING_SELECT)
          .eq('id', payload.new.id)
          .single()
        if (data) {
          const booking = data as unknown as BookingWithProfiles
          setOpenRequests((prev) => [...prev, booking])
          onNewRequest?.(booking)
        }
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'bookings',
      }, (payload) => {
        // Remove from open requests if it's been accepted or cancelled
        if (payload.new.babysitter_id !== null || payload.new.status !== 'pending') {
          setOpenRequests((prev) => prev.filter((r) => r.id !== payload.new.id))
        }
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user, onNewRequest])

  const acceptRequest = useCallback(async (bookingId: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('bookings')
      .update({ babysitter_id: user.id, status: 'confirmed' } as never)
      .eq('id', bookingId)
      .select(BOOKING_SELECT)
      .single()
    if (error) throw error
    setOpenRequests((prev) => prev.filter((r) => r.id !== bookingId))
    return data as unknown as BookingWithProfiles
  }, [user])

  return { openRequests, loading, acceptRequest }
}
