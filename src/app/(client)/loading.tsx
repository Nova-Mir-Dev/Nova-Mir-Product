export default function ClientLoading() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <nav
        style={{
          width: 240,
          borderRight: '1px solid var(--azimuth-color-border)',
        }}
      >
        <div style={{ padding: 'var(--azimuth-space-md)' }}>
          <div
            style={{
              height: 24,
              width: 120,
              background: 'var(--azimuth-color-surface)',
              borderRadius: 4,
              marginBottom: 16,
            }}
          />
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 36,
                marginBottom: 8,
                background: 'var(--azimuth-color-surface)',
                borderRadius: 4,
              }}
            />
          ))}
        </div>
      </nav>
      <main style={{ flex: 1, padding: 'var(--azimuth-space-lg)' }}>
        <div
          style={{
            height: 32,
            width: 200,
            background: 'var(--azimuth-color-surface)',
            borderRadius: 4,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            height: 200,
            background: 'var(--azimuth-color-surface)',
            borderRadius: 8,
          }}
        />
      </main>
    </div>
  )
}
