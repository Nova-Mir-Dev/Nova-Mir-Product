export default function SetupLoading() {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <p style={{ color: 'var(--azimuth-color-muted)' }}>Loading...</p>
    </div>
  )
}
