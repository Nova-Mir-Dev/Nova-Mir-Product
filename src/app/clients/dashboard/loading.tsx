import styles from './dashboard.module.css'

export default function DashboardLoading() {
  return (
    <div className={styles.container}>
      <div className={styles.welcomeBanner}>
        <div
          style={{
            width: 220,
            height: 28,
            background: 'var(--azimuth-color-surface-hover)',
            borderRadius: 6,
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      <div className={styles.projectStatusBar}>
        {[1, 2, 3, 4].map((i) => (
          <div className={styles.stageItem} key={i}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                background: 'var(--azimuth-color-surface-hover)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              style={{
                width: 50,
                height: 12,
                borderRadius: 4,
                background: 'var(--azimuth-color-surface-hover)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>

      <div className={styles.quickActions}>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              padding: 32,
              borderRadius: 'var(--azimuth-radius-md)',
              border: '1px solid var(--azimuth-color-border)',
              background: 'var(--azimuth-color-surface)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 100,
                height: 16,
                borderRadius: 4,
                background: 'var(--azimuth-color-surface-hover)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
            <div
              style={{
                width: 140,
                height: 12,
                borderRadius: 4,
                background: 'var(--azimuth-color-surface-hover)',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>

      <style>{`@keyframes shimmer { 0% { opacity: 0.6 } 50% { opacity: 1 } 100% { opacity: 0.6 } }`}</style>
    </div>
  )
}
