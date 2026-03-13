import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  max?: number
  size?: number
  interactive?: boolean
  onChange?: (value: number) => void
  className?: string
}

export function StarRating({ value, max = 5, size = 16, interactive, onChange, className }: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <Star
          key={star}
          size={size}
          className={cn(
            'transition-colors',
            star <= value ? 'text-amber-400 fill-amber-400' : 'text-gray-300 fill-gray-100',
            interactive && 'cursor-pointer hover:text-amber-400'
          )}
          onClick={() => interactive && onChange?.(star)}
        />
      ))}
    </div>
  )
}
