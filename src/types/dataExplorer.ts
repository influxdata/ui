// Write Data Modes
export enum WriteDataMode {
  Manual = 'Manual Entry',
  File = 'File Upload',
}

interface NewDataExplorerDataMeta {
  id: string
}

export type NewDataExplorerData = NewDataExplorerDataMeta | any

// data explorer has a fixed scope of { org: org.id, region: window.location.origin }
export interface QueryScope {
  org: string // orgID
  region: string // window.location
  [props: string]: any
}