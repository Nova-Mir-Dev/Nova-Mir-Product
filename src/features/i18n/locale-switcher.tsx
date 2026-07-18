'use client'

import { useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { locales } from '@/i18n/locales'
import { setLocale } from './actions'
import styles from './locale-switcher.module.css'

export function LocaleSwitcher() {
  const t = useTranslations('Dashboard.language')
  const active = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  return (
    <div className={styles.wrapper}>
      <label htmlFor="locale-switcher" className={styles.label}>
        {t('label')}
      </label>
      <select
        id="locale-switcher"
        className={styles.select}
        value={active}
        disabled={isPending}
        onChange={(event) => {
          const next = event.target.value
          startTransition(async () => {
            await setLocale(next)
            router.refresh()
          })
        }}
      >
        {locales.map((loc) => (
          <option key={loc} value={loc}>
            {t(loc)}
          </option>
        ))}
      </select>
    </div>
  )
}
