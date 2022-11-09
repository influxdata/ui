export interface Scripts {
  scripts?: Script[]
}
export interface Script {
  readonly id?: string
  name: string
  description?: string
  orgID: string
  script: string
  language?: ScriptLanguage
  url?: string
  readonly createdAt?: string
  readonly updatedAt?: string
  labels?: string[]
}

export type ScriptLanguage = 'flux' | 'sql'
