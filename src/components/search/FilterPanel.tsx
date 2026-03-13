import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BabysitterFilters } from '@/hooks/useBabysitters'

const LANGUAGES = ['English', 'Spanish', 'French', 'Hebrew', 'Arabic', 'Russian', 'Chinese']
const CERTIFICATIONS = ['CPR', 'First Aid', 'Early Childhood Education', 'Special Needs']

interface FilterPanelProps {
  filters: BabysitterFilters
  onChange: (filters: BabysitterFilters) => void
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  const toggleArray = (key: 'languages' | 'certifications', value: string) => {
    const current = filters[key] ?? []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    onChange({ ...filters, [key]: next.length ? next : undefined })
  }

  return (
    <div className="space-y-6">
      {/* Price range */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Hourly rate</p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            placeholder="Min"
            value={filters.minRate ?? ''}
            onChange={(e) => onChange({ ...filters, minRate: e.target.value ? +e.target.value : undefined })}
            className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <span className="text-gray-400">—</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.maxRate ?? ''}
            onChange={(e) => onChange({ ...filters, maxRate: e.target.value ? +e.target.value : undefined })}
            className="w-24 rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* Rating */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Minimum rating</p>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? undefined : r })}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm border transition-colors',
                filters.minRating === r
                  ? 'border-amber-400 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-600 hover:border-amber-300'
              )}
            >
              <Star size={13} className={filters.minRating === r ? 'fill-amber-400 text-amber-400' : 'text-gray-400'} />
              {r}+
            </button>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Languages</p>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              type="button"
              onClick={() => toggleArray('languages', lang)}
              className={cn(
                'px-3 py-1.5 rounded-xl text-sm border transition-colors',
                filters.languages?.includes(lang)
                  ? 'border-violet-500 bg-violet-50 text-violet-700'
                  : 'border-gray-200 text-gray-600 hover:border-violet-300'
              )}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">Certifications</p>
        <div className="flex flex-col gap-2">
          {CERTIFICATIONS.map((cert) => (
            <label key={cert} className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.certifications?.includes(cert) ?? false}
                onChange={() => toggleArray('certifications', cert)}
                className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
              />
              <span className="text-sm text-gray-700">{cert}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Clear */}
      <button
        type="button"
        onClick={() => onChange({})}
        className="text-sm text-violet-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  )
}
