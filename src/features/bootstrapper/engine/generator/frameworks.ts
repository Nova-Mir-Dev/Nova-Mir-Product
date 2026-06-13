import type { BootConfig } from '../../types'
import type { GeneratedFile } from './types'
import { generateNextJsFiles } from './nextjs'
import { generateViteReactFiles } from './vite-react'
import { generateRemixFiles } from './remix'
import { generateAstroFiles } from './astro'

export function generateFrameworkFiles(config: BootConfig): GeneratedFile[] {
  switch (config.framework) {
    case 'nextjs':
      return generateNextJsFiles(config)
    case 'vite-react':
      return generateViteReactFiles(config)
    case 'remix':
      return generateRemixFiles(config)
    case 'astro':
      return generateAstroFiles(config)
    default:
      return generateNextJsFiles(config)
  }
}
