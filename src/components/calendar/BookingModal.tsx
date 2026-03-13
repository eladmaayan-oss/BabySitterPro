import { useState } from 'react'
import { format } from 'date-fns'
import { Clock, Users } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useT } from '@/hooks/useT'

interface BookingModalProps {
  open: boolean
  onClose: () => void
  startTime: Date
  endTime: Date
  onBook: (notes: string) => Promise<void>
}

export function BookingModal({ open, onClose, startTime, endTime, onBook }: BookingModalProps) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useT()
  const m = t.bookingModal

  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60)

  const handlePost = async () => {
    setLoading(true)
    setError(null)
    try {
      await onBook(notes)
      onClose()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to post request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={m.title}>
      <div className="space-y-5">

        {/* Time summary */}
        <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
          <Clock size={18} className="text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-violet-900">{format(startTime, 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-sm text-violet-700">
              {format(startTime, 'h:mm a')} — {format(endTime, 'h:mm a')}
              <span className="ml-2 text-violet-500">({hours.toFixed(1)} {m.hrs})</span>
            </p>
          </div>
        </div>

        {/* Notification info */}
        <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
          <Users size={18} className="text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">{m.notice}</p>
        </div>

        {/* Notes */}
        <Textarea
          label={m.detailsLabel}
          placeholder={m.detailsPlaceholder}
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-200">{error}</div>
        )}

        <div className="flex gap-3">
          <Button variant="secondary" onClick={onClose} className="flex-1">{m.cancel}</Button>
          <Button onClick={handlePost} loading={loading} className="flex-1">{m.postRequest}</Button>
        </div>
      </div>
    </Modal>
  )
}
