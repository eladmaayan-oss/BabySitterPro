import { format } from 'date-fns'
import { Clock, User, DollarSign } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { formatCurrency } from '@/lib/utils'
import { useT } from '@/hooks/useT'
import type { BookingWithProfiles } from '@/types/domain'

interface BookingActionModalProps {
  booking: BookingWithProfiles
  onClose: () => void
  onConfirm: () => void
  onDecline: () => void
}

export function BookingActionModal({ booking, onClose, onConfirm, onDecline }: BookingActionModalProps) {
  const start = new Date(booking.start_time)
  const end = new Date(booking.end_time)
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const isPending = booking.status === 'pending'
  const { t } = useT()
  const m = t.bookingActionModal

  return (
    <Modal open onClose={onClose} title={isPending ? m.requestTitle : m.detailsTitle}>
      <div className="space-y-4">
        {/* Parent info */}
        {booking.parent && (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <Avatar src={booking.parent.avatar_url} name={booking.parent.full_name} size="md" />
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{m.fromParent}</p>
              <p className="font-semibold text-gray-900">{booking.parent.full_name || 'Unknown'}</p>
            </div>
          </div>
        )}

        {/* Time */}
        <div className="flex items-start gap-3 p-4 bg-violet-50 rounded-xl">
          <Clock size={18} className="text-violet-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-medium text-violet-900">{format(start, 'EEEE, MMMM d, yyyy')}</p>
            <p className="text-sm text-violet-700">
              {format(start, 'h:mm a')} — {format(end, 'h:mm a')} ({hours.toFixed(1)} hrs)
            </p>
          </div>
        </div>

        {/* Price */}
        {booking.total_price != null && booking.total_price > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-green-50 rounded-xl">
            <div className="flex items-center gap-2 text-green-700">
              <DollarSign size={16} />
              <span className="text-sm font-medium">{m.estimatedTotal}</span>
            </div>
            <span className="font-bold text-green-800">{formatCurrency(booking.total_price)}</span>
          </div>
        )}

        {/* Notes */}
        {booking.notes && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-1">
              <User size={14} className="text-amber-600" />
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide">{m.parentNote}</p>
            </div>
            <p className="text-sm text-gray-700">{booking.notes}</p>
          </div>
        )}

        {/* Status */}
        {!isPending && (
          <div className="flex items-center gap-2 text-sm px-1">
            <span className="text-gray-500">{m.status}:</span>
            <span className={`font-semibold capitalize ${
              booking.status === 'confirmed' ? 'text-violet-600' :
              booking.status === 'cancelled' ? 'text-red-500' :
              'text-emerald-600'
            }`}>{booking.status}</span>
          </div>
        )}

        {/* Actions */}
        {isPending ? (
          <div className="flex gap-3 pt-1">
            <Button variant="danger" onClick={onDecline} className="flex-1">{m.decline}</Button>
            <Button onClick={onConfirm} className="flex-1">{m.accept}</Button>
          </div>
        ) : (
          <Button variant="secondary" onClick={onClose} className="w-full">{m.close}</Button>
        )}
      </div>
    </Modal>
  )
}
