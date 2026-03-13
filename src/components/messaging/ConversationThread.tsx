import { useEffect, useRef } from 'react'
import { format } from 'date-fns'
import { Avatar } from '@/components/ui/Avatar'
import { MessageInput } from './MessageInput'
import { useMessages } from '@/hooks/useMessages'
import { useAuthStore } from '@/store/authStore'
import { cn } from '@/lib/utils'
import type { ConversationWithProfiles } from '@/types/domain'

interface ConversationThreadProps {
  conversation: ConversationWithProfiles
}

export function ConversationThread({ conversation }: ConversationThreadProps) {
  const { user } = useAuthStore()
  const { messages, loading, sendMessage } = useMessages(conversation.id)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const other = conversation.parent_id === user?.id ? conversation.babysitter : conversation.parent

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
        <Avatar src={other.avatar_url} name={other.full_name} size="sm" />
        <p className="font-semibold text-gray-900">{other.full_name}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">
            No messages yet. Say hello!
          </p>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender_id === user?.id
            return (
              <div key={msg.id} className={cn('flex items-end gap-2', isOwn && 'flex-row-reverse')}>
                {!isOwn && <Avatar src={other.avatar_url} name={other.full_name} size="xs" />}
                <div>
                  <div
                    className={cn(
                      'px-4 py-2.5 rounded-2xl text-sm max-w-xs',
                      isOwn
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                    )}
                  >
                    {msg.body}
                  </div>
                  <p className={cn('text-xs text-gray-400 mt-1', isOwn && 'text-right')}>
                    {format(new Date(msg.created_at), 'h:mm a')}
                  </p>
                </div>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput onSend={sendMessage} />
    </div>
  )
}
