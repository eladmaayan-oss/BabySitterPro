import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Profile } from '@/types/domain'

export function useProfile(userId?: string) {
  const { user, setProfile } = useAuthStore()
  const targetId = userId ?? user?.id
  const [profile, setLocalProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = useCallback(async () => {
    if (!targetId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase.from('profiles').select('*').eq('id', targetId).single()
    if (error) { setError(error.message) }
    else {
      const p = data as unknown as Profile
      setLocalProfile(p)
      if (!userId) setProfile(p)
    }
    setLoading(false)
  }, [targetId, userId, setProfile])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!targetId) return
    const { data, error } = await supabase
      .from('profiles')
      .update(updates as never)
      .eq('id', targetId)
      .select()
      .single()
    if (error) throw error
    const p = data as unknown as Profile
    setLocalProfile(p)
    if (!userId) setProfile(p)
  }, [targetId, userId, setProfile])

  const uploadAvatar = useCallback(async (file: File): Promise<void> => {
    if (!targetId) return
    const ext = file.name.split('.').pop()
    const path = `${targetId}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) throw uploadError
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
    await updateProfile({ avatar_url: publicUrl })
  }, [targetId, updateProfile])

  return { profile, loading, error, updateProfile, uploadAvatar, refetch: fetchProfile }
}
