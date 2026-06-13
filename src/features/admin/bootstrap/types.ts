export interface Preset {
  id: string
  name: string
  description: string
  icon: string
  popular: boolean
}

export interface ConfigValues {
  projectName: string
  framework: string
  hosting: string
  database: string
  auth: string
  payments: string
}
