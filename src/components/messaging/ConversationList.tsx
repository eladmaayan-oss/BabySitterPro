import { formatDistanceToNow } from 'date-fns'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import type { ConversationWithProfiles } from '@/types/domain'

interface ConversationListProps {
  conversations: ConversationWithProfiles[]
  selectedId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, selectedId, onSelect }: ConversationListProps) {
  const { user } = useAuthStore()

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        No conversations yet. Browse babysitters to start chatting!
      </div>
    )
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conv) => {
        const other = conv.parent_id === user?.id ? conv.babysitter : conv.parent
        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors text-left',
              selectedId === conv.id && 'bg-violet-50'
            )}
          >
            <Avatar src={other.avatar_url} name={other.full_name} size="md" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 truncate">{other.full_name}</p>
                {conv.last_message && (
                  <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                    {formatDistanceToNow(new Date(conv.last_message.created_at), { addSuffix: true })}
                  </span>
                )}
              </div>
              {conv.last_message && (
                <p className="text-xs text-gray-500 truncate mt-0.5">{conv.last_message.body}</p>
              )}
            </div>
          </button>
        )
      })}
    </div>
  )
}
