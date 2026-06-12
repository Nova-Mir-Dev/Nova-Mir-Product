import { ImageResponse } from 'next/og'

export async function generateOgImage(title: string, description?: string) {
  return new ImageResponse(
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '80px',
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: 700,
          color: '#ffffff',
          marginBottom: 20,
          lineHeight: 1.2,
        }}
      >
        {title}
      </div>
      {description && (
        <div style={{ fontSize: 30, color: '#a0a0b0' }}>{description}</div>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
