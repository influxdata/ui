export type CurrentPage = 'dashboard' | 'not set'
export type Theme = 'light' | 'dark'
export type NavBarState = 'expanded' | 'collapsed'

export interface VersionInfo {
  version: string
  commit: string
}

export interface FlowsCTA {
  [key: string]: boolean
}
