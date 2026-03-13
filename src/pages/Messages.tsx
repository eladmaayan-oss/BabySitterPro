import { useState } from 'react'
import { MessageCircle } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { ConversationList } from '@/components/messaging/ConversationList'
import { ConversationThread } from '@/components/messaging/ConversationThread'
import { useConversations } from '@/hooks/useMessages'
import type { ConversationWithProfiles } from '@/types/domain'

export function Messages() {
  const { conversations, loading } = useConversations()
  const [selectedId, setSelectedId] = useState<string | undefined>()

  const selected = conversations.find((c) => c.id === selectedId)

  return (
    <div className="flex-1 flex flex-col">
      <TopBar title="Messages" />
      <div className="flex-1 flex min-h-0">
        {/* Conversation list */}
        <div className="w-80 flex-shrink-0 border-r border-gray-100 bg-white overflow-y-auto">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-11 h-11 bg-gray-200 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          )}
        </div>

        {/* Thread */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selected ? (
            <ConversationThread conversation={selected as ConversationWithProfiles} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle size={28} className="text-gray-400" />
              </div>
              <h3 className="font-semibold text-gray-800 mb-1">Your messages</h3>
              <p className="text-sm text-gray-500">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
