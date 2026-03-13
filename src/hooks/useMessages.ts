import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { Message, ConversationWithProfiles, Conversation } from '@/types/domain'

export function useConversations() {
  const { user } = useAuthStore()
  const [conversations, setConversations] = useState<ConversationWithProfiles[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const fetch = async () => {
      const { data } = await supabase
        .from('conversations')
        .select(`
          *,
          parent:profiles!conversations_parent_id_fkey(id, full_name, avatar_url),
          babysitter:profiles!conversations_babysitter_id_fkey(id, full_name, avatar_url)
        `)
        .or(`parent_id.eq.${user.id},babysitter_id.eq.${user.id}`)
        .order('created_at', { ascending: false })
      setConversations((data as unknown as ConversationWithProfiles[]) ?? [])
      setLoading(false)
    }
    fetch()
  }, [user])

  const getOrCreateConversation = useCallback(async (parentId: string, babysitterId: string): Promise<Conversation> => {
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .eq('parent_id', parentId)
      .eq('babysitter_id', babysitterId)
      .single()
    if (existing) return existing as unknown as Conversation

    const { data, error } = await supabase
      .from('conversations')
      .insert({ parent_id: parentId, babysitter_id: babysitterId } as never)
      .select()
      .single()
    if (error) throw error
    return data as unknown as Conversation
  }, [])

  return { conversations, loading, getOrCreateConversation }
}

export function useMessages(conversationId?: string) {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!conversationId) { setLoading(false); return }

    const fetch = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
      setMessages((data as unknown as Message[]) ?? [])
      setLoading(false)
    }
    fetch()

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [conversationId])

  const sendMessage = useCallback(async (body: string) => {
    if (!user || !conversationId) return
    const optimistic: Message = {
      id: crypto.randomUUID(),
      conversation_id: conversationId,
      sender_id: user.id,
      body,
      read_at: null,
      created_at: new Date().toISOString(),
    }
    setMessages((prev) => [...prev, optimistic])

    const { error } = await supabase.from('messages').insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body,
    } as never)
    if (error) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      throw error
    }
  }, [user, conversationId])

  return { messages, loading, sendMessage }
}
