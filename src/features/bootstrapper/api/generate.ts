import { generate } from '../engine/generator/orchestrator'
import type { BootConfig } from '../types'

export interface GenerateResult {
  files: { path: string; content: string }[]
  warnings: string[]
  projectName: string
}

export function generateProject(config: BootConfig): GenerateResult {
  return generate(config)
}
