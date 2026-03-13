import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '@/lib/i18n'

interface LangState {
  lang: Lang
  toggle: () => void
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'en',
      toggle: () => set((s) => ({ lang: s.lang === 'en' ? 'he' : 'en' })),
    }),
    { name: 'babysitter-pro-lang' }
  )
)
