'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Text } from 'azimuth-ui'
import { logoutAction } from './actions'
import styles from './admin-nav.module.css'

interface UserMenuProps {
  name: string | null
  email: string | null
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const displayName = name || email?.split('@')[0] || 'User'

  return (
    <div className={styles.userMenu} ref={ref}>
      <button
        className={styles.userMenuTrigger}
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className={styles.userAvatar}>
          {displayName.charAt(0).toUpperCase()}
        </span>
        <Text element={{ size: 'sm' }} className={styles.userName}>
          Hello, {displayName}
        </Text>
      </button>
      {open && (
        <div className={styles.userMenuDropdown} role="menu">
          <Link
            href="/admin/settings"
            className={styles.userMenuItem}
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              className={styles.userMenuItem}
              role="menuitem"
            >
              Logout
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
