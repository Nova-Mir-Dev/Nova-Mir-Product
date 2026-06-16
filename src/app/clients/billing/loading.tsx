import styles from './billing.module.css'

export default function BillingLoading() {
  return (
    <div className={styles.container}>
      <div style={{ width: 120, height: 28, borderRadius: 6, background: 'var(--azimuth-color-surface-hover)', animation: 'shimmer 1.5s infinite', marginBottom: 24 }} />

      <div style={{ border: '1px solid var(--azimuth-color-border)', borderRadius: 'var(--azimuth-radius-md)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: 16, padding: '12px 16px', background: 'var(--azimuth-color-surface-hover)', borderBottom: '1px solid var(--azimuth-color-border)' }}>
          {[120, 80, 70, 90, 140].map((w, i) => (
            <div key={i} style={{ width: w, height: 14, borderRadius: 4, background: 'var(--azimuth-color-bg)', animation: 'shimmer 1.5s infinite' }} />
          ))}
        </div>
        {[1, 2, 3].map((row) => (
          <div key={row} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: row < 3 ? '1px solid var(--azimuth-color-border)' : undefined }}>
            {[100, 80, 70, 90, 140].map((w, i) => (
              <div key={i} style={{ width: w, height: 14, borderRadius: 4, background: 'var(--azimuth-color-surface-hover)', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ))}
      </div>

      <style>{`@keyframes shimmer { 0% { opacity: 0.6 } 50% { opacity: 1 } 100% { opacity: 0.6 } }`}</style>
    </div>
  )
}
