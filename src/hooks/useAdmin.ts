import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { AdminUser, InviteToken } from '@/types/domain'

export function useAdminUsers() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase.rpc('get_admin_users')
    if (!error) setUsers((data as unknown as AdminUser[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) fetchUsers() }, [user, fetchUsers])

  const toggleBan = useCallback(async (userId: string, banned: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: banned } as never)
      .eq('id', userId)
    if (error) throw error
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_banned: banned } : u))
  }, [])

  const toggleAdmin = useCallback(async (userId: string, isAdmin: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_admin: isAdmin } as never)
      .eq('id', userId)
    if (error) throw error
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, is_admin: isAdmin } : u))
  }, [])

  const deleteUser = useCallback(async (userId: string) => {
    const { error } = await supabase.rpc('admin_delete_user', { target_user_id: userId })
    if (error) throw error
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }, [])

  return { users, loading, toggleBan, toggleAdmin, deleteUser, refetch: fetchUsers }
}

export function useAdminTokens() {
  const { user } = useAuthStore()
  const [tokens, setTokens] = useState<InviteToken[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTokens = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invite_tokens')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setTokens((data as unknown as InviteToken[]) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { if (user) fetchTokens() }, [user, fetchTokens])

  const createToken = useCallback(async (note?: string, assignedEmail?: string) => {
    if (!user) return
    const { data, error } = await supabase
      .from('invite_tokens')
      .insert({ created_by: user.id, note: note || null, assigned_email: assignedEmail || null } as never)
      .select()
      .single()
    if (error) throw error
    const token = data as unknown as InviteToken
    setTokens((prev) => [token, ...prev])
    return token
  }, [user])

  const deleteToken = useCallback(async (tokenId: string) => {
    const { error } = await supabase.from('invite_tokens').delete().eq('id', tokenId)
    if (error) throw error
    setTokens((prev) => prev.filter((t) => t.id !== tokenId))
  }, [])

  return { tokens, loading, createToken, deleteToken, refetch: fetchTokens }
}

// Validate a token during signup (no auth needed)
export async function validateInviteToken(token: string) {
  const { data, error } = await supabase
    .from('invite_tokens')
    .select('*')
    .eq('token', token)
    .is('used_by', null)
    .single()
  if (error || !data) return null
  return data as unknown as InviteToken
}

// Mark token as used after signup
export async function claimInviteToken(token: string, userId: string) {
  await supabase
    .from('invite_tokens')
    .update({ used_by: userId, used_at: new Date().toISOString() } as never)
    .eq('token', token)
    .is('used_by', null)
}
