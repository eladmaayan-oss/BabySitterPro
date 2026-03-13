import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { session, user, profile, loading } = useAuthStore()

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, role: 'parent' | 'babysitter') => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, role } },
      })
      if (error) throw error
      // Upsert the profile immediately using the service session.
      // This runs regardless of email confirmation status.
      if (data.user) {
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, full_name: fullName, role } as never, { onConflict: 'id' })
      }
      return data
    },
    []
  )

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return { session, user, profile, loading, signUp, signIn, signInWithGoogle, signOut }
}
