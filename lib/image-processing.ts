// Image processing utilities
// Configure with your image service (Cloudinary, imgix, sharp, etc.)

export interface ImageOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
  fit?: 'cover' | 'contain' | 'fill'
}

export function getImageUrl(src: string, options: ImageOptions = {}): string {
  // TODO: Integrate with your image processing service
  const params = new URLSearchParams()
  if (options.width) params.set('w', String(options.width))
  if (options.height) params.set('h', String(options.height))
  if (options.quality) params.set('q', String(options.quality))
  if (options.format) params.set('f', options.format)
  if (options.fit) params.set('fit', options.fit)
  const query = params.toString()
  return query ? `${src}?${query}` : src
}

export function generateSrcSet(
  src: string,
  widths: number[] = [320, 640, 960, 1280],
): string {
  return widths.map((w) => `${getImageUrl(src, { width: w })} ${w}w`).join(', ')
}
