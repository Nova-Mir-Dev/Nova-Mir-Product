import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'

export function generatePwaFiles(config: BootConfig): GeneratedFile[] {
  if (!config.pwaEnabled) return []

  const name = config.appTitle || config.projectName
  const shortName = name.length > 12 ? name.slice(0, 12) : name

  return [
    {
      path: 'public/manifest.json',
      content: JSON.stringify(
        {
          name,
          short_name: shortName,
          start_url: '/',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#000000',
          icons: [
            { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
        null,
        2,
      ) + '\n',
    },
    {
      path: 'public/sw.js',
      content: `// Customize cache strategies for your app's needs.

const CACHE_NAME = "v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
];

self.addEventListener("install", (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)),
  );
});

self.addEventListener("fetch", (event: FetchEvent) => {
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(event.request);
        return response;
      } catch {
        const cached = await caches.match(event.request);
        return cached ?? new Response("Offline", { status: 503 });
      }
    })(),
  );
});
`,
    },
  ]
}
