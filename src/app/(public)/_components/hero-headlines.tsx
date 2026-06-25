'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { Button } from 'azimuth-ui'
import styles from '../landing.module.css'

interface Headline {
  id: string
  headline: string
  subtitle: string
  cta_label: string
  cta_href: string
}

export function HeroContent({ fallback }: { fallback: Headline }) {
  const t = useTranslations('Hero')
  const [headline, setHeadline] = useState<Headline>(fallback)

  useEffect(() => {
    fetch('/api/content/hero-headlines')
      .then((res) => res.json())
      .then((data: Headline[]) => {
        if (data.length > 0) {
          const pick = data[Math.floor(Math.random() * data.length)]!
          setHeadline(pick)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      <h1 className={styles.heroTitle} data-hero-variant={headline.id}>
        {headline.headline}
      </h1>
      <p className={styles.heroSubtitle}>
        {headline.subtitle}
      </p>
      <div className={styles.heroActions}>
        <Button variant="primary" size="lg" asChild>
          <Link href={headline.cta_href}>{headline.cta_label}</Link>
        </Button>
        <Button variant="secondary" size="lg" asChild>
          <Link href="/process">{t('secondaryCta')}</Link>
        </Button>
      </div>
    </>
  )
}
