import { useState } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSend: (text: string) => Promise<void>
  disabled?: boolean
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed || sending) return
    setSending(true)
    setText('')
    try { await onSend(trimmed) } finally { setSending(false) }
  }

  return (
    <div className="flex items-end gap-2 p-4 border-t border-gray-100">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
        placeholder="Type a message…"
        rows={1}
        disabled={disabled || sending}
        className="flex-1 resize-none rounded-2xl border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 max-h-32"
      />
      <button
        onClick={handleSend}
        disabled={!text.trim() || sending}
        className="w-10 h-10 bg-violet-600 text-white rounded-2xl flex items-center justify-center hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
        aria-label="Send"
      >
        <Send size={16} />
      </button>
    </div>
  )
}
