import { useLangStore } from '@/store/langStore'
import { translations } from '@/lib/i18n'

export function useT() {
  const { lang, toggle } = useLangStore()
  const t = translations[lang]
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  return { t, dir, lang, toggle }
}
