export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              var mode = localStorage.getItem('theme-mode') || 'system';
              if (mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.setAttribute('data-theme', 'dark');
              } else {
                document.documentElement.setAttribute('data-theme', 'light');
              }
            } catch(e) {}
          })();
        `,
      }}
    />
  )
}
