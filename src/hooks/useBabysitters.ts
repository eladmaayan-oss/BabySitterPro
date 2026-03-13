import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/domain'

export interface BabysitterFilters {
  search?: string
  minRate?: number
  maxRate?: number
  minRating?: number
  languages?: string[]
  certifications?: string[]
}

export function useBabysitters(filters: BabysitterFilters = {}) {
  const [babysitters, setBabysitters] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBabysitters = async () => {
      setLoading(true)
      let query = supabase.from('profiles').select('*').eq('role', 'babysitter')

      if (filters.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
      }
      if (filters.minRate !== undefined) query = query.gte('hourly_rate', filters.minRate)
      if (filters.maxRate !== undefined) query = query.lte('hourly_rate', filters.maxRate)
      if (filters.minRating !== undefined) query = query.gte('rating_avg', filters.minRating)
      if (filters.languages?.length) query = query.overlaps('languages', filters.languages)
      if (filters.certifications?.length) query = query.overlaps('certifications', filters.certifications)

      const { data, error } = await query.order('rating_avg', { ascending: false })
      if (error) setError(error.message)
      else setBabysitters((data as unknown as Profile[]) ?? [])
      setLoading(false)
    }

    fetchBabysitters()
  }, [
    filters.search,
    filters.minRate,
    filters.maxRate,
    filters.minRating,
    filters.languages?.join(','),
    filters.certifications?.join(','),
  ])

  return { babysitters, loading, error }
}
