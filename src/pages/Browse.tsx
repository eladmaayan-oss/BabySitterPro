import { useState, useEffect } from 'react'
import { SlidersHorizontal, X } from 'lucide-react'
import { TopBar } from '@/components/layout/TopBar'
import { SearchBar } from '@/components/search/SearchBar'
import { FilterPanel } from '@/components/search/FilterPanel'
import { BabysitterGrid } from '@/components/search/BabysitterGrid'
import { Button } from '@/components/ui/Button'
import { useBabysitters, type BabysitterFilters } from '@/hooks/useBabysitters'

function useDebounce<T>(value: T, delay = 400) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function Browse() {
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<BabysitterFilters>({})
  const [filterOpen, setFilterOpen] = useState(false)

  const debouncedSearch = useDebounce(search)
  const { babysitters, loading } = useBabysitters({ ...filters, search: debouncedSearch || undefined })

  const activeFilterCount = [
    filters.minRate,
    filters.maxRate,
    filters.minRating,
    ...(filters.languages ?? []),
    ...(filters.certifications ?? []),
  ].filter(Boolean).length

  return (
    <div className="flex-1">
      <TopBar title="Find a Babysitter" />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <Button
            variant="secondary"
            onClick={() => setFilterOpen(!filterOpen)}
            className="relative flex-shrink-0"
          >
            <SlidersHorizontal size={16} />
            Filters
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-violet-600 text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        <div className="flex gap-6">
          {/* Filter panel - sidebar on desktop, overlay on mobile */}
          {filterOpen && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Filters</h3>
                  <button onClick={() => setFilterOpen(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={18} />
                  </button>
                </div>
                <FilterPanel filters={filters} onChange={setFilters} />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-500 mb-4">
              {loading ? 'Searching…' : `${babysitters.length} babysitter${babysitters.length !== 1 ? 's' : ''} found`}
            </p>
            <BabysitterGrid babysitters={babysitters} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  )
}
