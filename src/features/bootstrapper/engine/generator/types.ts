export interface GeneratedFile {
  path: string
  content: string
}

export interface GeneratorResult {
  files: GeneratedFile[]
  warnings: string[]
  projectName: string
}
