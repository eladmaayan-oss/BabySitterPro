import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Availability } from '@/types/domain'

export function useAvailability(babysitterId?: string) {
  const [slots, setSlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSlots = useCallback(async () => {
    if (!babysitterId) { setLoading(false); return }
    const { data } = await supabase
      .from('availability')
      .select('*')
      .eq('babysitter_id', babysitterId)
    setSlots((data as unknown as Availability[]) ?? [])
    setLoading(false)
  }, [babysitterId])

  useEffect(() => { fetchSlots() }, [fetchSlots])

  const addSlot = useCallback(async (slot: Omit<Availability, 'id'>) => {
    const { data, error } = await supabase
      .from('availability')
      .insert(slot as never)
      .select()
      .single()
    if (error) throw error
    const s = data as unknown as Availability
    setSlots((prev) => [...prev, s])
    return s
  }, [])

  const removeSlot = useCallback(async (slotId: string) => {
    const { error } = await supabase.from('availability').delete().eq('id', slotId)
    if (error) throw error
    setSlots((prev) => prev.filter((s) => s.id !== slotId))
  }, [])

  return { slots, loading, addSlot, removeSlot, refetch: fetchSlots }
}
