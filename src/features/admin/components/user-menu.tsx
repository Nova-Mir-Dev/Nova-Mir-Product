'use client'

import { Menu, Avatar } from 'azimuth-ui'
import { useRouter } from 'next/navigation'
import { logoutAction } from './actions'

interface UserMenuProps {
  name: string | null
  email: string | null
}

export function UserMenu({ name, email }: UserMenuProps) {
  const router = useRouter()
  const displayName = name || email?.split('@')[0] || ''

  return (
    <Menu
      trigger={
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <Avatar fallback={displayName} size="xs" />
          <span style={{ fontSize: '0.875rem' }}>Hello, {displayName}</span>
        </span>
      }
      side="right"
      items={[
        { key: 'settings', label: 'Settings' },
        { key: 'logout', label: 'Logout', danger: true, separator: true },
      ]}
      onSelect={async (key) => {
        if (key === 'settings') router.push('/admin/settings')
        if (key === 'logout') await logoutAction()
      }}
    />
  )
}
